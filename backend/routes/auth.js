const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

//
// ✅ REGISTER
//
router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role || "user"   // IMPORTANT for admin/user system
    });

    await user.save();

    res.json({
      message: "User registered successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//
// ✅ LOGIN
//
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id },
      "secretkey",
      { expiresIn: "1d" }
    );

    // ✅ CLEAN RESPONSE (IMPORTANT FOR FRONTEND)
    res.json({
  token,
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role   // 🔥 IMPORTANT
  }
});

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;