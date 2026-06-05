import express from 'express';
import { 
  submitProject, 
  getMyProjects, 
  getAllProjects, 
  reviewProject 
} from '../controllers/projectController.js';
import { authenticateToken, requireAdmin, requireIntern } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, requireIntern, submitProject);
router.get('/my', authenticateToken, requireIntern, getMyProjects);

router.get('/', authenticateToken, requireAdmin, getAllProjects);
router.put('/:id/review', authenticateToken, requireAdmin, reviewProject);

export default router;
