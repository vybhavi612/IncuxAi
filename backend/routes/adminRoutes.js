const express = require("express");

const router = express.Router();

const {
    getAttendanceRecords
} = require("../controllers/adminController");

router.get(
    "/attendance",
    getAttendanceRecords
);

module.exports = router;