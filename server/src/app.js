const express = require("express");
const cors = require("cors");

const app = express();

// ✅ IMPORTANT: सबसे पहले ये लगाओ
const allowedOrigins = [
  "http://localhost:5173",
  "https://ashish-kumar-sahani.github.io"
];

app.use(cors({
  origin: function(origin, callback){
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked"));
    }
  },
  credentials: true
}));

// ✅ यह भी जरूरी है (preflight fix)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://ashish-kumar-sahani.github.io");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/usage", require("./routes/usageRoutes"));
app.use("/api/limit", require("./routes/limitRoutes"));

module.exports = app;