const express = require('express');
const router = express.Router();
const { getAllUsers, assignRepo, getRepo } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.post('/repo', authMiddleware, adminMiddleware, assignRepo);
router.get('/repo', authMiddleware, adminMiddleware, getRepo);

module.exports = router;