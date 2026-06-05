const express = require("express");

const router = express.Router();

const Attendance = require("../models/Attendance");


// ==========================
// 🟢 LOGIN TIME
// ==========================
router.post("/login-time", async (req, res) => {

  try {

    const { userId, photo } = req.body;

    const now = new Date();

    // OFFICE START TIME = 10:00 AM
    const officeStart = new Date();

    officeStart.setHours(10, 0, 0, 0);

    let status = "ON_TIME";

    let lateMinutes = 0;

    // CHECK LATE
    if (now > officeStart) {

      status = "LATE";

      lateMinutes = Math.floor(
        (now - officeStart) / 60000
      );
    }

    // CREATE ATTENDANCE
    const attendance = await Attendance.create({

      userId,

      loginTime: now,

      status,

      lateMinutes,

      photo: photo || ""

    });

    res.json(attendance);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// ==========================
// 🔴 LOGOUT TIME
// ==========================
router.post("/logout", async (req, res) => {

  try {

    const { userId } = req.body;

    // GET LATEST ATTENDANCE
    const attendance = await Attendance.findOne({
      userId
    }).sort({ createdAt: -1 });

    if (!attendance) {

      return res.json({
        error: "Attendance not found"
      });

    }

    // SAVE LOGOUT TIME
    attendance.logoutTime = new Date();

    // CALCULATE TOTAL WORK TIME
    const totalMs =
      attendance.logoutTime - attendance.loginTime;

    attendance.totalMinutes =
      Math.floor(totalMs / 1000 / 60);

    await attendance.save();

    res.json(attendance);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// ==========================
// 📋 ADD DAILY WORK PROGRESS
// ==========================
router.post("/add-progress", async (req, res) => {

  try {

    const { userId, task } = req.body;

    const attendance = await Attendance.findOne({
      userId
    }).sort({ createdAt: -1 });

    if (!attendance) {

      return res.json({
        error: "Attendance not found"
      });

    }

    attendance.progress.push({

      task,

      time: new Date()

    });

    await attendance.save();

    res.json(attendance);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// ==========================
// 🔗 ADD GITHUB LINK
// ==========================
router.post("/add-github", async (req, res) => {

  try {

    const { userId, githubLink } = req.body;

    const attendance = await Attendance.findOne({
      userId
    }).sort({ createdAt: -1 });

    if (!attendance) {

      return res.json({
        error: "Attendance not found"
      });

    }

    attendance.githubLink = githubLink;

    await attendance.save();

    res.json(attendance);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// ==========================
// 📄 GET USER ATTENDANCE
// ==========================
router.get("/user/:userId", async (req, res) => {

  try {

    const records = await Attendance.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });

    res.json(records);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


module.exports = router;