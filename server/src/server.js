
const app = require("./app");
const { getPool } = require("./config/db");

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await getPool();
    console.log("🚀 Server running on port", PORT);
  } catch (err) {
    console.log("❌ DB Connection failed", err);
  }
});