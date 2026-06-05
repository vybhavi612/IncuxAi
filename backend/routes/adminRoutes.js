import express from 'express';
import { 
  getActivityLogs, 
  exportActivityLogsCSV,
  exportAttendanceCSV
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/logs', authenticateToken, requireAdmin, getActivityLogs);
router.get('/logs/export', authenticateToken, requireAdmin, exportActivityLogsCSV);
router.get('/attendance/export', authenticateToken, requireAdmin, exportAttendanceCSV);

export default router;
