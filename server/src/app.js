const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/authRoutes");
const usageRoutes = require("./routes/usageRoutes");
const limitRoutes = require("./routes/limitRoutes");
const { poolConnect } = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");
poolConnect
.then(() => console.log("Connected to SQL Server ✅"))
.catch(err => console.error("Database Connection Failed ❌", err));
app.use(cors({
origin: "http://localhost:5173",
credentials: true
}));
app.use(express.json());
app.use(errorHandler);
app.use("/api/auth", authRoutes);
app.use("/api/usage", usageRoutes);
app.use("/api/limit", limitRoutes);

app.get("/", (req, res) => {
res.json({ message: "Screen Time Tracker API Running 🚀" });
});

module.exports = app;
