const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: String,
  loginTime: Date,
  logoutTime: Date,
  totalHours: Number
});

module.exports = mongoose.model("Attendance", attendanceSchema);