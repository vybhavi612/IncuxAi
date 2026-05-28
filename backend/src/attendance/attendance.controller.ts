import { Controller, Get, Post, Put, Body, Req, UseGuards, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('status')
  async getStatus(@Req() req: any) {
    return this.attendanceService.getStatus(req.user.id);
  }

  @Post('checkin')
  async checkIn(@Req() req: any, @Body() body: any) {
    return this.attendanceService.checkIn(req.user.id, body);
  }

  @Post('checkout')
  async checkOut(@Req() req: any, @Body() body: any) {
    return this.attendanceService.checkOut(req.user.id, body);
  }

  // --- ADMIN ONLY ENDPOINTS ---

  @Get('active-sessions')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getActiveSessions() {
    return this.attendanceService.getActiveSessions();
  }

  @Get('history')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getHistory() {
    return this.attendanceService.getHistoryAdmin();
  }

  @Post('force-close/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async forceClose(@Req() req: any, @Param('userId') userId: string) {
    return this.attendanceService.forceClose(req.user.id, userId);
  }

  @Put('override/:attendanceId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async overrideAttendance(
    @Req() req: any,
    @Param('attendanceId') attendanceId: string,
    @Body() body: any
  ) {
    return this.attendanceService.overrideAttendance(req.user.id, attendanceId, body);
  }
}
