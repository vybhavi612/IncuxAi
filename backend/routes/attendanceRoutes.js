const express = require('express');
const router = express.Router();
const { loginAttendance, logoutAttendance } = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', authMiddleware, loginAttendance);
router.post('/logout', authMiddleware, logoutAttendance);

module.exports = router;