import { db } from '../services/firebaseService.js';

export const logActivity = async (userId, action, details, req = null) => {
  try {
    let ipAddress = 'unknown';
    let device = 'unknown';

    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'unknown';
      device = req.headers['user-agent'] || 'unknown';
    }

    const logData = {
      userId,
      action,
      details,
      ipAddress,
      device,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('activitylogs').add(logData);
    console.log(`Activity Logged: ${action} - ${details}`);
  } catch (error) {
    console.error('Error logging activity in Firestore:', error.message);
  }
};
