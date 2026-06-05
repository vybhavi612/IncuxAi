import { db } from '../services/firebaseService.js';

// @desc    Get all activity logs (paginated, filtered, searchable)
// @route   GET /api/admin/logs
// @access  Private (Admin only)
export const getActivityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { action, userId, search } = req.query;

    let snapshot = await db.collection('activitylogs').get();

    let logs = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      
      // Resolve user details
      const userDoc = await db.collection('users').doc(data.userId).get();
      let userObj = null;
      if (userDoc.exists) {
        const uData = userDoc.data();
        delete uData.password;
        userObj = { id: userDoc.id, ...uData };
      }

      logs.push({
        _id: doc.id,
        id: doc.id,
        ...data,
        createdAt,
        userId: userObj
      });
    }

    // Apply filtering in memory
    if (action) {
      logs = logs.filter(log => log.action === action);
    }

    if (userId) {
      logs = logs.filter(log => log.userId && log.userId.id === userId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      logs = logs.filter(log => {
        const name = log.userId ? `${log.userId.firstName} ${log.userId.lastName}`.toLowerCase() : '';
        const email = log.userId ? log.userId.email.toLowerCase() : '';
        const details = log.details ? log.details.toLowerCase() : '';
        const act = log.action ? log.action.toLowerCase() : '';
        
        return name.includes(searchLower) || 
               email.includes(searchLower) || 
               details.includes(searchLower) || 
               act.includes(searchLower);
      });
    }

    const totalLogs = logs.length;
    // Sort by createdAt descending in memory (avoids composite index)
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const paginatedLogs = logs.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      count: paginatedLogs.length,
      totalPages: Math.ceil(totalLogs / limit),
      currentPage: page,
      totalLogs,
      data: paginatedLogs
    });
  } catch (error) {
    console.error('Error fetching activity logs from Firestore:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

// @desc    Export activity logs to CSV
// @route   GET /api/admin/logs/export
// @access  Private (Admin only)
export const exportActivityLogsCSV = async (req, res) => {
  try {
    const snapshot = await db.collection('activitylogs').get();

    const logs = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      
      const userDoc = await db.collection('users').doc(data.userId).get();
      let userObj = null;
      if (userDoc.exists) {
        const uData = userDoc.data();
        delete uData.password;
        userObj = { id: userDoc.id, ...uData };
      }

      logs.push({
        _id: doc.id,
        id: doc.id,
        ...data,
        createdAt,
        userId: userObj
      });
    }

    // Sort by createdAt descending in memory
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const headers = ['Timestamp', 'Email', 'User Name', 'Role', 'Action', 'Details', 'IP Address', 'Device'];
    
    const rows = logs.map(log => {
      const email = log.userId ? log.userId.email : 'N/A';
      const name = log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : 'System/Unknown';
      const role = log.userId ? log.userId.role : 'N/A';
      const detailsEscaped = log.details ? log.details.replace(/"/g, '""') : '';
      const deviceEscaped = log.device ? log.device.replace(/"/g, '""') : 'N/A';
      const ip = log.ipAddress || 'N/A';
      const timestamp = log.createdAt ? log.createdAt.toISOString() : 'N/A';

      return [
        timestamp,
        email,
        name,
        role,
        log.action,
        detailsEscaped,
        ip,
        deviceEscaped
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=system_audit_logs.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting logs:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

// @desc    Export attendance roster to CSV
// @route   GET /api/admin/attendance/export
// @access  Private (Admin only)
export const exportAttendanceCSV = async (req, res) => {
  try {
    const snapshot = await db.collection('attendances').get();

    const attendance = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const clockIn = data.clockIn?.toDate ? data.clockIn.toDate() : new Date(data.clockIn);
      const clockOut = data.clockOut?.toDate ? data.clockOut.toDate() : (data.clockOut ? new Date(data.clockOut) : null);
      
      const userDoc = await db.collection('users').doc(data.internId).get();
      let internObj = null;
      if (userDoc.exists) {
        internObj = { id: userDoc.id, ...userDoc.data() };
      }

      attendance.push({
        _id: doc.id,
        id: doc.id,
        ...data,
        clockIn,
        clockOut,
        internId: internObj
      });
    }

    // Sort by clockIn descending in memory
    attendance.sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn));

    const headers = ['Date', 'Intern Name', 'Email', 'Clock In', 'Clock Out', 'Status', 'Late By (min)', 'Session Duration (min)'];
    
    const rows = attendance.map(record => {
      const name = record.internId ? `${record.internId.firstName} ${record.internId.lastName}` : 'N/A';
      const email = record.internId ? record.internId.email : 'N/A';
      const clockInTime = record.clockIn ? record.clockIn.toISOString() : '';
      const clockOutTime = record.clockOut ? record.clockOut.toISOString() : 'Active';
      const status = record.status || 'N/A';
      const lateBy = record.lateBy || 0;
      const duration = record.sessionDuration || 0;

      return [
        record.date,
        name,
        email,
        clockInTime,
        clockOutTime,
        status,
        lateBy,
        duration
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=intern_attendance_report.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting attendance roster:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};
