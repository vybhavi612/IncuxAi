import { PrismaClient, Role, AttendanceStatus, SessionState } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with WorkPulse starter data...');

  // 1. Clean existing records
  await prisma.auditLog.deleteMany({});
  await prisma.gitHubMetric.deleteMany({});
  await prisma.repository.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create System Settings
  const settings = [
    { key: 'registration_allowed', value: 'true' },
    { key: 'min_working_hours', value: '8' },
    { key: 'grace_period_mins', value: '15' },
    { key: 'force_close_policy', value: 'INCOMPLETE' }, // INCOMPLETE or ABSENT
    { key: 'session_timeout_hours', value: '12' },
    { key: 'auto_logout_inactivity_mins', value: '30' }
  ];

  for (const s of settings) {
    await prisma.setting.create({ data: s });
  }
  console.log('✔ System Settings seeded.');

  // 3. Create Users with Hashed Passwords
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const userPasswordHash = bcrypt.hashSync('user123', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'admin@workpulse.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      active: true,
      timezone: 'America/New_York',
    }
  });

  const dev1 = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'dev1@workpulse.com',
      passwordHash: userPasswordHash,
      role: Role.USER,
      active: true,
      githubUsername: 'alexrivera-dev',
      timezone: 'America/Los_Angeles',
    }
  });

  const dev2 = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'dev2@workpulse.com',
      passwordHash: userPasswordHash,
      role: Role.USER,
      active: true,
      githubUsername: 'elena-rostova',
      timezone: 'Europe/Paris',
    }
  });

  console.log('✔ User roles created (Admin & Users).');

  // 4. Create Repositories assigned to devs
  const repo1 = await prisma.repository.create({
    data: {
      userId: dev1.id,
      repoName: 'workpulse-frontend-nextjs',
      repoUrl: 'https://github.com/alexrivera-dev/workpulse-frontend-nextjs',
      provider: 'github'
    }
  });

  const repo2 = await prisma.repository.create({
    data: {
      userId: dev1.id,
      repoName: 'microservices-shared-lib',
      repoUrl: 'https://github.com/alexrivera-dev/microservices-shared-lib',
      provider: 'github'
    }
  });

  const repo3 = await prisma.repository.create({
    data: {
      userId: dev2.id,
      repoName: 'workpulse-nestjs-api',
      repoUrl: 'https://github.com/elena-rostova/workpulse-nestjs-api',
      provider: 'github'
    }
  });

  console.log('✔ Developer repositories linked.');

  // 5. Seed Attendance Logs for the last 14 days
  const now = new Date();
  const statuses = [AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.INCOMPLETE, AttendanceStatus.PRESENT];
  
  for (let i = 14; i >= 1; i--) {
    const checkInDate = new Date();
    checkInDate.setDate(now.getDate() - i);
    checkInDate.setHours(9, Math.floor(Math.random() * 20), 0, 0);

    const checkOutDate = new Date(checkInDate);
    checkOutDate.setHours(checkInDate.getHours() + 8 + Math.floor(Math.random() * 3));

    // Exclude weekends for attendance seed
    const day = checkInDate.getDay();
    if (day !== 0 && day !== 6) {
      const isOverride = i === 5; // create a manual admin override simulation
      const status = isOverride ? AttendanceStatus.PRESENT : (i % 8 === 0 ? AttendanceStatus.INCOMPLETE : AttendanceStatus.PRESENT);

      await prisma.attendance.create({
        data: {
          userId: dev1.id,
          checkIn: checkInDate,
          checkOut: status === AttendanceStatus.PRESENT ? checkOutDate : null,
          localCheckIn: checkInDate.toLocaleTimeString(),
          localCheckOut: status === AttendanceStatus.PRESENT ? checkOutDate.toLocaleTimeString() : null,
          timezone: dev1.timezone,
          status: status,
          duration: status === AttendanceStatus.PRESENT ? Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / 60000) : 0,
          adminOverride: isOverride,
          overrideReason: isOverride ? 'Forgot to check out - validated manually by Sarah Jenkins' : null
        }
      });

      const dev2CheckIn = new Date(checkInDate);
      dev2CheckIn.setHours(8, Math.floor(Math.random() * 15), 0, 0);
      const dev2CheckOut = new Date(dev2CheckIn);
      dev2CheckOut.setHours(dev2CheckIn.getHours() + 8 + Math.floor(Math.random() * 2));

      await prisma.attendance.create({
        data: {
          userId: dev2.id,
          checkIn: dev2CheckIn,
          checkOut: dev2CheckOut,
          localCheckIn: dev2CheckIn.toLocaleTimeString(),
          localCheckOut: dev2CheckOut.toLocaleTimeString(),
          timezone: dev2.timezone,
          status: AttendanceStatus.PRESENT,
          duration: Math.floor((dev2CheckOut.getTime() - dev2CheckIn.getTime()) / 60000)
        }
      });
    }
  }

  // Create an active session for Elena (dev2) currently working
  const activeCheckIn = new Date();
  activeCheckIn.setHours(activeCheckIn.getHours() - 3); // Started 3 hours ago
  
  await prisma.attendance.create({
    data: {
      userId: dev2.id,
      checkIn: activeCheckIn,
      checkOut: null,
      localCheckIn: activeCheckIn.toLocaleTimeString(),
      timezone: dev2.timezone,
      status: AttendanceStatus.PRESENT, // actively clocked in
      duration: 0
    }
  });

  await prisma.session.create({
    data: {
      userId: dev2.id,
      loginTime: activeCheckIn,
      sessionState: SessionState.ACTIVE,
      deviceMetadata: 'Chrome 124.0.0 / Windows 11',
      ipAddress: '192.168.1.45',
      browserFingerprint: 'browser_fngr_elena_active'
    }
  });

  console.log('✔ Attendance history and active desk tracking initialized.');

  // 6. Seed GitHub Metrics (Past 30 days) to render charts instantly
  for (let i = 30; i >= 0; i--) {
    const metricDate = new Date();
    metricDate.setDate(now.getDate() - i);
    metricDate.setHours(0,0,0,0);

    const isWeekend = metricDate.getDay() === 0 || metricDate.getDay() === 6;

    // Elena metric (high activity)
    await prisma.gitHubMetric.create({
      data: {
        repoId: repo3.id,
        commits: isWeekend ? 0 : Math.floor(Math.random() * 5),
        prs: isWeekend ? 0 : (Math.random() > 0.7 ? 1 : 0),
        issues: isWeekend ? 0 : (Math.random() > 0.8 ? 1 : 0),
        mergedPrs: isWeekend ? 0 : (Math.random() > 0.75 ? 1 : 0),
        additions: isWeekend ? 0 : Math.floor(Math.random() * 250),
        deletions: isWeekend ? 0 : Math.floor(Math.random() * 60),
        snapshotDate: metricDate
      }
    });

    // Alex metric (medium activity split across 2 repos)
    await prisma.gitHubMetric.create({
      data: {
        repoId: repo1.id,
        commits: isWeekend ? 0 : Math.floor(Math.random() * 3),
        prs: isWeekend ? 0 : (Math.random() > 0.8 ? 1 : 0),
        issues: isWeekend ? 0 : (Math.random() > 0.9 ? 1 : 0),
        mergedPrs: isWeekend ? 0 : (Math.random() > 0.85 ? 1 : 0),
        additions: isWeekend ? 0 : Math.floor(Math.random() * 120),
        deletions: isWeekend ? 0 : Math.floor(Math.random() * 30),
        snapshotDate: metricDate
      }
    });

    await prisma.gitHubMetric.create({
      data: {
        repoId: repo2.id,
        commits: isWeekend ? 0 : Math.floor(Math.random() * 2),
        prs: 0,
        issues: 0,
        mergedPrs: 0,
        additions: isWeekend ? 0 : Math.floor(Math.random() * 40),
        deletions: isWeekend ? 0 : Math.floor(Math.random() * 10),
        snapshotDate: metricDate
      }
    });
  }

  console.log('✔ Developer Git commit history timelines populated.');

  // 7. Seed Audit Logs
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_STARTUP',
      entityType: 'SYSTEM',
      metadata: JSON.stringify({ description: 'WorkPulse server started up successfully.' })
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: 'USER_ROLE_ASSIGNED',
      entityType: 'USER',
      entityId: dev1.id,
      metadata: JSON.stringify({ assignedRole: Role.USER, name: dev1.name })
    }
  });

  console.log('✔ Audit log framework initialized.');
  console.log('✔ Seeding complete! Credentials: admin@workpulse.com / admin123  and  dev1@workpulse.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
