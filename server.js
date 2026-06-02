const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Student Attendance Portal Backend is Running!");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});