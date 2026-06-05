const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    const hashed = await bcrypt.hash(req.body.password, 10);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashed
    });

    await user.save();
    res.json({ message: "User registered successfully" });
});

// LOGIN
router.post("/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.json({ error: "User not found" });

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) return res.json({ error: "Wrong password" });

    const token = jwt.sign({ id: user._id }, "secretkey");

    res.json({ token, user });
});

module.exports = router;