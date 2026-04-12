const express = require("express");
const router = express.Router();
const limitController = require("../controllers/limitController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/set", authMiddleware, limitController.setLimit);
router.get("/all", authMiddleware, limitController.getLimits);
router.get("/status", authMiddleware, limitController.getLimitStatus);
module.exports = router;