import express from 'express';
import { 
  clockIn, 
  clockOut, 
  getMyAttendance, 
  getActiveSessions, 
  getTodaySummary,
  getAttendanceStatus
} from '../controllers/attendanceController.js';
import { authenticateToken, requireAdmin, requireIntern } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/clock-in', authenticateToken, requireIntern, clockIn);
router.post('/clock-out', authenticateToken, requireIntern, clockOut);
router.get('/my', authenticateToken, requireIntern, getMyAttendance);
router.get('/status', authenticateToken, requireIntern, getAttendanceStatus);

router.get('/active', authenticateToken, requireAdmin, getActiveSessions);
router.get('/summary', authenticateToken, requireAdmin, getTodaySummary);

export default router;
