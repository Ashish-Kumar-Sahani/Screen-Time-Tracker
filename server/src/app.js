const express = require("express");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://ashish-kumar-sahani.github.io"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

app.use(express.json());

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/usage", require("./routes/usageRoutes"));
app.use("/api/limit", require("./routes/limitRoutes"));
app.use("/api/tracker", require("./routes/trackerRoutes"));

module.exports = app;