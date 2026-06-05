const express = require("express");

const router = express.Router();

const Attendance =
require("../models/Attendance");

router.get(
  "/attendance",
  async (req, res) => {

    try {

      const data =
        await Attendance.find()
        .populate(
          "userId",
          "name email role"
        );

      res.json(data);

    } catch (err) {

      res.status(500).json({
        error: err.message
      });
    }
  }
);

module.exports = router;