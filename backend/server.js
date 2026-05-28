const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes");

const attendanceRoutes = require("./routes/attendanceRoutes");

const adminRoutes = require("./routes/adminRoutes");

const githubRoutes = require("./routes/githubRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/github", githubRoutes);

app.get("/", (req, res) => {
    res.send("Backend Running Successfully");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});