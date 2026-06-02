const express = require("express");

const router = express.Router();

const User = require("../models/User");

router.post("/register", async (req, res) => {


try {

    const user = new User(req.body);

    await user.save();

    res.json({
        success: true,
        message: "Registration Successful"
    });

}

catch (err) {

    res.json({
        success: false,
        message: "Email Already Exists"
    });

}


});

router.post("/login", async (req, res) => {


const { name, email } = req.body;

const user = await User.findOne({ email });

if (!user) {

    return res.json({
        success: false,
        message: "User Not Found"
    });

}

if (user.name !== name) {

    return res.json({
        success: false,
        message: "Invalid Name"
    });

}

res.json({
    success: true,
    message: "Login Successful",
    user
});


});

module.exports = router;
