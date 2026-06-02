const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({

userEmail: String,

github: String,

desc: String,

time: String

});

module.exports = mongoose.model("Task", taskSchema);