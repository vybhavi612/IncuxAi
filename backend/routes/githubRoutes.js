const express = require("express");

const router = express.Router();

const {
    getRepository
} = require("../controllers/githubController");

router.get(
    "/:username/:repo",
    getRepository
);

module.exports = router;