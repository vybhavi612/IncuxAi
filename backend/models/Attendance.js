const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // LOGIN / LOGOUT
  loginTime: {
    type: Date
  },

  logoutTime: {
    type: Date
  },

  // ATTENDANCE STATUS
  status: {
    type: String,
    default: "PENDING" // ON_TIME / LATE / PENDING
  },

  // LATE TRACKING
  lateMinutes: {
    type: Number,
    default: 0
  },

  // TOTAL WORKING TIME
  totalMinutes: {
    type: Number,
    default: 0
  },

  // DAILY WORK UPDATES
  progress: [
    {
      task: String,

      time: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // GITHUB REPOSITORY
  githubLink: {
    type: String,
    default: ""
  },

  // USER PHOTO
  photo: {
    type: String,
    default: ""
  },

  // CREATED DATE
  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model(
  "Attendance",
  AttendanceSchema
);