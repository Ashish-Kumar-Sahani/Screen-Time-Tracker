const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const usageController = require("../controllers/usageController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, usageController.addUsage);
router.get("/all", authMiddleware, usageController.getUsage);
router.get("/today", authMiddleware, usageController.getTodayTotal);
router.get("/summary", authMiddleware, usageController.getAppSummary);
router.get("/today-summary", authMiddleware, usageController.getTodaySummary);
router.get("/weekly-report", authMiddleware, usageController.getWeeklyReport);
router.get("/productivity-score", authMiddleware, usageController.getProductivityScore);
router.get("/weekly-graph", protect, usageController.getWeeklyGraph);
router.delete("/clear", authMiddleware, usageController.clearUsage);
module.exports = router;
