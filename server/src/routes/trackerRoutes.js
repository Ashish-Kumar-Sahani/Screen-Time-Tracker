const express = require("express");
const router = express.Router();
const {
  toggleTracker,
  getTrackerStatus,
  saveTrackerToken,
  launchTracker
} = require("../controllers/trackerController");


router.post("/toggle", toggleTracker);
router.get("/status", getTrackerStatus);
router.post("/save-token", saveTrackerToken);
router.post("/launch", launchTracker);
module.exports = router;