const express = require("express");

const cors = require("cors");

const connectDB =
require("./config/db");

const app = express();

app.use(cors());

app.use(express.json());

connectDB();

app.use(
  "/api/auth",
  require("./routes/auth")
);

app.use(
  "/api/attendance",
  require("./routes/attendance")
);

app.use(
  "/api/admin",
  require("./routes/admin")
);

app.listen(5001, () => {

  console.log(
    "Server running on port 5001"
  );
});