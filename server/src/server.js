
const app = require("./app");
const { getPool } = require("./config/db");
const cors = require("cors");

app.use(cors({
  origin: "https://ashish-kumar-sahani.github.io",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.options("*", cors());

const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

app.listen(PORT, async () => {
  try {
    await getPool();
    console.log("🚀 Server running on port", PORT);
  } catch (err) {
    console.log("❌ DB Connection failed", err);
  }
});