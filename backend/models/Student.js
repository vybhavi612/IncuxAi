const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  college: {
    type: String,
    required: true,
  },

  branch: {
    type: String,
    required: true,
  },

  photo: {
    type: String,
  },

  role: {
    type: String,
    default: "student",
  },
});

module.exports = mongoose.model("Student", studentSchema);