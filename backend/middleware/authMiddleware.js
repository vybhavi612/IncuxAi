import jwt from 'jsonwebtoken';
import { db } from '../services/firebaseService.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: No Token Provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey123456!');
    
    // Fetch user from Firestore
    const userDoc = await db.collection('users').doc(decoded.id).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();

    if (!userData.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Standardize object fields to prevent breaking controller endpoints
    req.user = {
      _id: userDoc.id,
      id: userDoc.id,
      ...userData
    };
    
    next();
  } catch (error) {
    console.error('JWT Token verification error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Invalid or Expired Token'
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Admins Only'
    });
  }
};

export const requireIntern = (req, res, next) => {
  if (req.user && req.user.role === 'intern') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Interns Only'
    });
  }
};
