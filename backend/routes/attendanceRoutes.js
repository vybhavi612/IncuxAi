const express = require("express");

const router = express.Router();

const {

    markAttendance,

    getTodayAttendance,

    logoutAttendance

} = require(
"../controllers/attendanceController"
);

router.post(
"/mark",
markAttendance
);

router.get(
"/today/:studentId",
getTodayAttendance
);

router.post(
"/logout",
logoutAttendance
);

module.exports = router;