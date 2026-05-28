import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { SettingsService } from '../settings/settings.service';
import { AttendanceStatus, SessionState } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
    private settingsService: SettingsService
  ) {}

  async getStatus(userId: string) {
    // Find if user has an active check-in (checkOut is null)
    const active = await this.prisma.attendance.findFirst({
      where: { userId, checkOut: null },
      orderBy: { checkIn: 'desc' },
    });

    const history = await this.prisma.attendance.findMany({
      where: { userId },
      orderBy: { checkIn: 'desc' },
      take: 10,
    });

    return {
      active: active ? {
        id: active.id,
        checkIn: active.checkIn,
        localCheckIn: active.localCheckIn,
        status: active.status,
      } : null,
      history,
    };
  }

  async checkIn(userId: string, data: any) {
    const { localTimestamp, timezone, browserFingerprint, ipAddress, deviceMetadata } = data;

    // 1. Prevent duplicate active check-ins
    const active = await this.prisma.attendance.findFirst({
      where: { userId, checkOut: null },
    });
    if (active) {
      throw new BadRequestException('You already have an active check-in session.');
    }

    const serverNow = new Date();

    // 2. Create Attendance session record using Server Timestamps as source of truth
    const attendance = await this.prisma.attendance.create({
      data: {
        userId,
        checkIn: serverNow,
        localCheckIn: localTimestamp || serverNow.toLocaleTimeString(),
        timezone: timezone || 'UTC',
        status: AttendanceStatus.PRESENT,
      },
    });

    // 3. Create interactive session record
    await this.prisma.session.create({
      data: {
        userId,
        loginTime: serverNow,
        sessionState: SessionState.ACTIVE,
        deviceMetadata: deviceMetadata || 'Unknown Browser',
        ipAddress: ipAddress || '0.0.0.0',
        browserFingerprint: browserFingerprint || 'unknown_fingerprint',
      },
    });

    // 4. Log in Audit Trail
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'ATTENDANCE_CHECK_IN',
        entityType: 'ATTENDANCE',
        entityId: attendance.id,
        metadata: JSON.stringify({ serverTime: serverNow, localTime: localTimestamp, ip: ipAddress }),
      },
    });

    // 5. Broadcast to Admins
    await this.notifyAdminsOfTelemetryUpdate();

    return attendance;
  }

  async checkOut(userId: string, data: any) {
    const { localTimestamp } = data;
    const serverNow = new Date();

    // 1. Find active attendance
    const attendance = await this.prisma.attendance.findFirst({
      where: { userId, checkOut: null },
      orderBy: { checkIn: 'desc' },
    });
    if (!attendance) {
      throw new BadRequestException('No active check-in session found to check out of.');
    }

    // 2. Calculate duration in minutes
    const checkInTime = new Date(attendance.checkIn);
    const durationMins = Math.floor((serverNow.getTime() - checkInTime.getTime()) / 60000);

    // 3. Update attendance record
    const updatedAttendance = await this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: serverNow,
        localCheckOut: localTimestamp || serverNow.toLocaleTimeString(),
        duration: durationMins,
      },
    });

    // 4. Close matching session
    const activeSession = await this.prisma.session.findFirst({
      where: { userId, sessionState: SessionState.ACTIVE },
      orderBy: { loginTime: 'desc' },
    });
    if (activeSession) {
      await this.prisma.session.update({
        where: { id: activeSession.id },
        data: {
          logoutTime: serverNow,
          sessionState: SessionState.CLOSED,
        },
      });
    }

    // 5. Log in Audit Trail
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'ATTENDANCE_CHECK_OUT',
        entityType: 'ATTENDANCE',
        entityId: attendance.id,
        metadata: JSON.stringify({ durationMins, serverTime: serverNow, localTime: localTimestamp }),
      },
    });

    // 6. Broadcast to Admins
    await this.notifyAdminsOfTelemetryUpdate();

    return updatedAttendance;
  }

  async getActiveSessions() {
    return this.prisma.session.findMany({
      where: { sessionState: SessionState.ACTIVE },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            timezone: true,
          },
        },
      },
      orderBy: { loginTime: 'desc' },
    });
  }

  async getHistoryAdmin() {
    return this.prisma.attendance.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { checkIn: 'desc' },
      take: 200,
    });
  }

  async forceClose(adminId: string, userId: string) {
    const activeSession = await this.prisma.session.findFirst({
      where: { userId, sessionState: SessionState.ACTIVE },
      orderBy: { loginTime: 'desc' },
    });

    const activeAttendance = await this.prisma.attendance.findFirst({
      where: { userId, checkOut: null },
      orderBy: { checkIn: 'desc' },
    });

    if (!activeSession && !activeAttendance) {
      throw new BadRequestException('No active sessions found for this user.');
    }

    const serverNow = new Date();
    
    // Read force close policy from admin settings
    const policy = await this.settingsService.getVal('force_close_policy', 'INCOMPLETE');
    const finalStatus = policy === 'ABSENT' ? AttendanceStatus.ABSENT : AttendanceStatus.INCOMPLETE;

    // Update attendance
    if (activeAttendance) {
      const checkInTime = new Date(activeAttendance.checkIn);
      const durationMins = Math.floor((serverNow.getTime() - checkInTime.getTime()) / 60000);

      await this.prisma.attendance.update({
        where: { id: activeAttendance.id },
        data: {
          checkOut: serverNow,
          localCheckOut: 'FORCE CLOSED BY ADMIN',
          duration: durationMins,
          status: finalStatus,
          adminOverride: true,
          overrideReason: 'Session force closed by Administrator due to policy timeout.',
        },
      });
    }

    // Update Session
    if (activeSession) {
      await this.prisma.session.update({
        where: { id: activeSession.id },
        data: {
          logoutTime: serverNow,
          sessionState: SessionState.FORCE_CLOSED,
        },
      });
    }

    // Audit trace
    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_FORCE_CLOSE_SESSION',
        entityType: 'USER',
        entityId: userId,
        metadata: JSON.stringify({ policyApplied: policy, statusAssigned: finalStatus }),
      },
    });

    // Notify the active client socket to trigger immediate logout alert
    this.socketGateway.broadcastToAll(`force_logout_${userId}`, {
      reason: 'Your active session has been force-closed by an Administrator.',
    });

    // Notify admins to update dashboard metrics
    await this.notifyAdminsOfTelemetryUpdate();

    return { success: true, policyApplied: policy, status: finalStatus };
  }

  async overrideAttendance(adminId: string, attendanceId: string, data: any) {
    const { status, duration, overrideReason } = data;

    const record = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });
    if (!record) {
      throw new NotFoundException('Attendance log not found.');
    }

    const updated = await this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        status: status as AttendanceStatus,
        duration: duration ? parseInt(duration) : record.duration,
        adminOverride: true,
        overrideReason: overrideReason || 'Manual adjustment by administrator.',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_OVERRIDE_ATTENDANCE',
        entityType: 'ATTENDANCE',
        entityId: attendanceId,
        metadata: JSON.stringify({
          before: { status: record.status, duration: record.duration },
          after: { status: updated.status, duration: updated.duration },
          reason: overrideReason
        }),
      },
    });

    return updated;
  }

  // Helper broadcast routine
  private async notifyAdminsOfTelemetryUpdate() {
    const activeSessions = await this.getActiveSessions();
    this.socketGateway.broadcastToAdmins('active_sessions_update', activeSessions);
  }

  // ----------------------------------------------------
  // AUTOMATED RULES: Background scheduler
  // Runs every hour to check for timeout rules
  // ----------------------------------------------------
  @Cron(CronExpression.EVERY_HOUR)
  async checkSessionTimeouts() {
    // Read timeout setting
    const timeoutSetting = await this.settingsService.getVal('session_timeout_hours', '12');
    const timeoutHours = parseInt(timeoutSetting);
    
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - timeoutHours);

    // Find all sessions active past timeout threshold
    const expiredSessions = await this.prisma.session.findMany({
      where: {
        sessionState: SessionState.ACTIVE,
        loginTime: { lt: cutoffTime }
      }
    });

    if (expiredSessions.length > 0) {
      // console.log(`[Scheduler] Found ${expiredSessions.length} timed out attendance sessions. Force closing...`);
      for (const sess of expiredSessions) {
        try {
          await this.forceClose(null, sess.userId); // pass null to designate SYSTEM agent
        } catch (err) {
          // console.error(`[Scheduler] Failed to close session for user ${sess.userId}`, err);
        }
      }
    }
  }
}
