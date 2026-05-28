const express = require("express");

const router = express.Router();

const {

    registerStudent,

    loginStudent,

    adminLogin

} = require(
    "../controllers/authController"
);

router.post(
    "/register",
    registerStudent
);

router.post(
    "/login",
    loginStudent
);

router.post(
    "/admin-login",
    adminLogin
);

module.exports = router;