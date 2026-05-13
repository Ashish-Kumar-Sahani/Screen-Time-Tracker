const fs = require("fs");
const path = require("path");

// project root ka token.json
const filePath = path.join(__dirname, "../../../token.json");

// TRACKER TOGGLE
exports.toggleTracker = (req, res) => {
  try {
    const { enabled } = req.body;

    let data = {
      token: "",
      enabled: false
    };

    // agar file already hai to old token preserve karo
    if (fs.existsSync(filePath)) {
      data = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
      );
    }

    data.enabled = enabled;

    fs.writeFileSync(
      filePath,
      JSON.stringify(data, null, 2)
    );

    res.json({
      success: true,
      message: enabled
        ? "Tracker enabled"
        : "Tracker disabled"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// LAUNCH TRACKER
const { spawn } = require("child_process");

let trackerProcess = null;

exports.launchTracker = (req, res) => {
  try {
    if (trackerProcess) {
      return res.json({ message: "Tracker already running" });
    }

    const trackerPath = path.join(__dirname, "../../../tracker");

    trackerProcess = spawn("npm", ["start"], {
      cwd: trackerPath,
      shell: true,
      detached: true,
      stdio: "ignore"
    });

    trackerProcess.unref();

    res.json({ message: "Tracker launched" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET TRACKER STATUS
exports.getTrackerStatus = (req, res) => {
  try {
    if (!fs.existsSync(filePath)) {
      return res.json({
        enabled: false
      });
    }

    const data = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );

    res.json({
      enabled: data.enabled || false
    });
  } catch (error) {
    console.error(error);

    res.json({
      enabled: false
    });
  }
};
// SAVE TRACKER TOKEN
exports.saveTrackerToken = (req, res) => {
  try {
    const { token } = req.body;

    let data = {
      token: "",
      enabled: false
    };

    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    data.token = token;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      message: "Tracker token saved"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};