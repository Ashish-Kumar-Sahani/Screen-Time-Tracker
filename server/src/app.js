const express = require("express");
const cors = require("cors");

const app = express();


const authRoutes = require("./routes/authRoutes");
const usageRoutes = require("./routes/usageRoutes");
const limitRoutes = require("./routes/limitRoutes");
const errorHandler = require("./middleware/errorMiddleware");

// app.use(cors({
//   origin: ["http://localhost:5173","http://localhost:5174"],
//   credentials: true
// }));
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ashish-kumar-sahani.github.io"
  ],
  credentials: true
}));
app.options("/*", cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/usage", usageRoutes);
app.use("/api/limit", limitRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.json({ message: "Screen Time Tracker API Running 🚀" });
});

module.exports = app;