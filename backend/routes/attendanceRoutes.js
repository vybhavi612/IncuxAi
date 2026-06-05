const express = require("express");
const Attendance = require("../models/Attendance");

const router = express.Router();

// LOGIN TIME
router.post("/login-time", async (req, res) => {
    const record = new Attendance({
        userId: req.body.userId,
        loginTime: new Date(),
        status: "logged-in"
    });

    await record.save();
    res.json(record);
});

// LOGOUT TIME
router.post("/logout-time", async (req, res) => {
    const record = await Attendance.findOne({ userId: req.body.userId })
        .sort({ loginTime: -1 });

    record.logoutTime = new Date();
    record.status = "logged-out";

    await record.save();

    res.json(record);
});

module.exports = router;