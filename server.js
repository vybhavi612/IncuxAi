const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/attendance");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  college: String,
  loginTime: Date,
  logoutTime: Date,
  totalTime: Number,
  lateBy: Number,
  work: String,
  github: String,
  image: String
});

const User = mongoose.model("User", UserSchema);

// REGISTER
app.post("/register", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.send("Registered successfully");
});

// LOGIN
app.post("/login", async (req, res) => {
  const user = await User.findById(req.body.userId);

  if (!user) return res.send("User not found");

  const now = new Date();
  user.loginTime = now;

  // Late calculation (example: class at 9 AM)
  const classTime = new Date();
  classTime.setHours(9,0,0);

  if (now > classTime) {
    user.lateBy = Math.floor((now - classTime)/60000);
  } else {
    user.lateBy = 0;
  }

  await user.save();
  res.send("Login recorded. Late by " + user.lateBy + " mins");
});

// LOGOUT
app.post("/logout", async (req, res) => {
  const user = await User.findById(req.body.userId);

  const now = new Date();
  user.logoutTime = now;

  user.totalTime = Math.floor((user.logoutTime - user.loginTime)/60000);

  await user.save();
  res.send("Logout. Total time: " + user.totalTime + " mins");
});

// WORK UPDATE
app.post("/work", async (req, res) => {
  const user = await User.findById(req.body.userId);

  user.work = req.body.work;
  user.github = req.body.github;

  await user.save();
  res.send("Work updated");
});

// SAVE IMAGE
app.post("/photo", async (req, res) => {
  const user = await User.findById(req.body.userId);

  user.image = req.body.image;
  await user.save();

  res.send("Photo saved");
});

// ADMIN - GET ALL USERS
app.get("/admin", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.listen(5000, () => console.log("Server running"));