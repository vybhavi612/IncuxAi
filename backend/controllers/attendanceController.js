import { db } from '../services/firebaseService.js';
import { logActivity } from '../utils/activityLogger.js';

// Cutoff Time configuration: 10:00 AM
const CUTOFF_HOUR = 10;
const CUTOFF_MINUTE = 0;

// Helper to populate intern details for a list of docs
const populateAttendanceList = async (snapshot) => {
  const list = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Resolve dates
    const clockIn = data.clockIn?.toDate ? data.clockIn.toDate() : new Date(data.clockIn);
    const clockOut = data.clockOut?.toDate ? data.clockOut.toDate() : (data.clockOut ? new Date(data.clockOut) : null);
    
    const userDoc = await db.collection('users').doc(data.internId).get();
    let internObj = null;
    if (userDoc.exists) {
      const uData = userDoc.data();
      delete uData.password;
      internObj = { id: userDoc.id, ...uData };
    }

    list.push({
      _id: doc.id,
      id: doc.id,
      ...data,
      clockIn,
      clockOut,
      internId: internObj
    });
  }
  return list;
};

// Helper for single document
const populateAttendanceDoc = async (docId) => {
  const doc = await db.collection('attendances').doc(docId).get();
  if (!doc.exists) return null;
  const data = doc.data();
  
  const clockIn = data.clockIn?.toDate ? data.clockIn.toDate() : new Date(data.clockIn);
  const clockOut = data.clockOut?.toDate ? data.clockOut.toDate() : (data.clockOut ? new Date(data.clockOut) : null);

  const userDoc = await db.collection('users').doc(data.internId).get();
  let internObj = null;
  if (userDoc.exists) {
    const uData = userDoc.data();
    delete uData.password;
    internObj = { id: userDoc.id, ...uData };
  }

  return {
    _id: doc.id,
    id: doc.id,
    ...data,
    clockIn,
    clockOut,
    internId: internObj
  };
};

// @desc    Clock-In Attendance
// @route   POST /api/attendance/clock-in
// @access  Private (Intern only)
export const clockIn = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Check if user already clocked in for this date in Firestore
    const existingSnapshot = await db.collection('attendances')
      .where('internId', '==', req.user.id)
      .where('date', '==', dateStr)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: `You have already clocked in today (${dateStr}).`
      });
    }

    // Check if there is an active clock-in that wasn't clocked out
    const activeSnapshot = await db.collection('attendances')
      .where('internId', '==', req.user.id)
      .where('clockOut', '==', null)
      .limit(1)
      .get();

    if (!activeSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'You have an active clock-in session from a previous day. Please clock out of that session first.'
      });
    }

    // Determine late status
    const cutoff = new Date(now);
    cutoff.setHours(CUTOFF_HOUR, CUTOFF_MINUTE, 0, 0);

    let status = 'on-time';
    let lateBy = 0;

    if (now > cutoff) {
      status = 'late';
      const diffMs = now - cutoff;
      lateBy = Math.floor(diffMs / 60000);
    }

    const attendanceData = {
      internId: req.user.id,
      date: dateStr,
      clockIn: now,
      clockOut: null,
      status,
      lateBy,
      sessionDuration: 0,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'unknown',
      device: req.headers['user-agent'] || 'unknown',
      createdAt: now,
      updatedAt: now
    };

    const docRef = await db.collection('attendances').add(attendanceData);
    
    // Log Activity
    await logActivity(
      req.user.id, 
      'clock-in', 
      `Clocked in at ${now.toLocaleTimeString()} (${status}${status === 'late' ? ` - late by ${lateBy} mins` : ''})`, 
      req
    );

    const populatedRecord = await populateAttendanceDoc(docRef.id);

    // Emit Socket.io event for Live updates
    if (req.io) {
      req.io.emit('attendance_update', {
        action: 'clock-in',
        record: populatedRecord
      });

      if (status === 'late') {
        req.io.emit('new_alert', {
          type: 'late_arrival',
          message: `${req.user.firstName} ${req.user.lastName} arrived late by ${lateBy} minutes.`,
          timestamp: now
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Clocked in successfully.',
      data: populatedRecord
    });
  } catch (error) {
    console.error('Error clocking in:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

// @desc    Clock-Out Attendance
// @route   POST /api/attendance/clock-out
// @access  Private (Intern only)
export const clockOut = async (req, res) => {
  try {
    const now = new Date();

    // Find active attendance record in Firestore
    const activeSnapshot = await db.collection('attendances')
      .where('internId', '==', req.user.id)
      .where('clockOut', '==', null)
      .limit(1)
      .get();

    if (activeSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'No active clock-in session found. You must clock in first.'
      });
    }

    const doc = activeSnapshot.docs[0];
    const data = doc.data();
    const clockInTime = data.clockIn?.toDate ? data.clockIn.toDate() : new Date(data.clockIn);

    const diffMs = now - clockInTime;
    const sessionDuration = Math.round(diffMs / 60000);

    await db.collection('attendances').doc(doc.id).update({
      clockOut: now,
      sessionDuration,
      updatedAt: now
    });

    // Log Activity
    await logActivity(
      req.user.id, 
      'clock-out', 
      `Clocked out at ${now.toLocaleTimeString()} (Duration: ${sessionDuration} mins)`, 
      req
    );

    const populatedRecord = await populateAttendanceDoc(doc.id);

    // Emit Socket.io event
    if (req.io) {
      req.io.emit('attendance_update', {
        action: 'clock-out',
        record: populatedRecord
      });
    }

    res.status(200).json({
      success: true,
      message: 'Clocked out successfully.',
      data: populatedRecord
    });
  } catch (error) {
    console.error('Error clocking out:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

// @desc    Get Authenticated Intern's logs
// @route   GET /api/attendance/my
// @access  Private (Intern only)
export const getMyAttendance = async (req, res) => {
  try {
    const snapshot = await db.collection('attendances')
      .where('internId', '==', req.user.id)
      .get();

    const records = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const clockIn = data.clockIn?.toDate ? data.clockIn.toDate() : new Date(data.clockIn);
      const clockOut = data.clockOut?.toDate ? data.clockOut.toDate() : (data.clockOut ? new Date(data.clockOut) : null);
      
      records.push({
        _id: doc.id,
        id: doc.id,
        ...data,
        clockIn,
        clockOut
      });
    });

    // Sort by clockIn descending in memory (avoids Firestore composite index)
    records.sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn));

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error fetching my logs:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

// @desc    Get Active sessions
// @route   GET /api/attendance/active
// @access  Private (Admin only)
export const getActiveSessions = async (req, res) => {
  try {
    const snapshot = await db.collection('attendances')
      .where('clockOut', '==', null)
      .get();

    const records = await populateAttendanceList(snapshot);
    // Sort by clockIn descending (avoids Firestore composite index)
    records.sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn));

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error fetching active sessions:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

// @desc    Get Today's Summary statistics
// @route   GET /api/attendance/summary
// @access  Private (Admin only)
export const getTodaySummary = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Total registered interns count
    const internsSnapshot = await db.collection('users')
      .where('role', '==', 'intern')
      .get();
    
    const totalInterns = internsSnapshot.size;

    // Attendance today
    const logsSnapshot = await db.collection('attendances')
      .where('date', '==', dateStr)
      .get();

    const todayLogs = await populateAttendanceList(logsSnapshot);

    const totalLogged = todayLogs.length;
    const active = todayLogs.filter(log => log.clockOut === null).length;
    const late = todayLogs.filter(log => log.status === 'late').length;
    const onTime = todayLogs.filter(log => log.status === 'on-time').length;
    const absent = totalInterns - totalLogged > 0 ? totalInterns - totalLogged : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalInterns,
        totalLogged,
        active,
        late,
        onTime,
        absent,
        date: dateStr
      },
      todayLogs
    });
  } catch (error) {
    console.error('Error fetching today summary:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

// @desc    Get Authenticated Intern's active session state (to persist button states)
// @route   GET /api/attendance/status
// @access  Private (Intern only)
export const getAttendanceStatus = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const todayRecordSnapshot = await db.collection('attendances')
      .where('internId', '==', req.user.id)
      .where('date', '==', dateStr)
      .limit(1)
      .get();

    const openSessionSnapshot = await db.collection('attendances')
      .where('internId', '==', req.user.id)
      .where('clockOut', '==', null)
      .limit(1)
      .get();

    const hasClockedInToday = !todayRecordSnapshot.empty;
    const todayRecord = hasClockedInToday ? { id: todayRecordSnapshot.docs[0].id, ...todayRecordSnapshot.docs[0].data() } : null;
    const activeSession = !openSessionSnapshot.empty ? { id: openSessionSnapshot.docs[0].id, ...openSessionSnapshot.docs[0].data() } : null;

    res.status(200).json({
      success: true,
      hasClockedInToday,
      activeSession,
      todayRecord
    });
  } catch (error) {
    console.error('Error getting status:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
