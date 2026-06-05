import express from 'express';
import { updateUserProfile, getAllUsers } from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/:id', authenticateToken, updateUserProfile);
router.get('/', authenticateToken, requireAdmin, getAllUsers);

export default router;
