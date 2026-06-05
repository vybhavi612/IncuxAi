import express from 'express';
import { 
  getMyAnalytics, 
  getInternAnalytics, 
  getAdminOverview 
} from '../controllers/analyticsController.js';
import { authenticateToken, requireAdmin, requireIntern } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', authenticateToken, requireIntern, getMyAnalytics);
router.get('/intern/:id', authenticateToken, requireAdmin, getInternAnalytics);
router.get('/overview', authenticateToken, requireAdmin, getAdminOverview);

export default router;
