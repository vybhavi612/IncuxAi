const express = require('express');
const router = express.Router();
const { getCommits } = require('../controllers/gitController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/commits', authMiddleware, getCommits);

module.exports = router;