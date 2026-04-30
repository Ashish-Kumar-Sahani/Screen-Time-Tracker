const express = require("express");
const cors = require("cors");

const app = express();

const authRoutes = require("./routes/authRoutes");
const usageRoutes = require("./routes/usageRoutes");
const limitRoutes = require("./routes/limitRoutes");
const errorHandler = require("./middleware/errorMiddleware");

// ✅ CORS CONFIG (IMPORTANT)
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://ashish-kumar-sahani.github.io"
  ],
  credentials: true
};

// ✅ MUST be at top
app.use(cors(corsOptions));

// ✅ Handle preflight requests properly
app.options("*", cors(corsOptions));

app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/usage", usageRoutes);
app.use("/api/limit", limitRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.json({ message: "Screen Time Tracker API Running 🚀" });
});

// ✅ Error handler LAST में
app.use(errorHandler);

module.exports = app;