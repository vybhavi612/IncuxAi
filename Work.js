const mongoose = require("mongoose");

const workSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: String,
  description: String
});

module.exports = mongoose.model("Work", workSchema);