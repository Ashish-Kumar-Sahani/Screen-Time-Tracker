const { app } = require("electron");
const { exec } = require("child_process");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_URL = "http://localhost:5000/api/usage/add";

// root token.json
const CONFIG_FILE = path.join(__dirname, "../token.json");

let currentApp = null;
let startTime = Date.now();
let usageMap = {};

const SAVE_INTERVAL = 30000; // 1 min
const TRACK_INTERVAL = 5000; // 5 sec

function getConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return { token: "", enabled: false };
    }

    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
  } catch (error) {
    console.log("CONFIG READ ERROR:", error.message);
    return { token: "", enabled: false };
  }
}

function getText(input) {
  if (!input) return "";

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return `${parsed.title || ""} ${parsed.processName || ""}`.toLowerCase();
    } catch {
      return input.toLowerCase();
    }
  }

  return `${input.title || ""} ${input.processName || ""}`.toLowerCase();
}
function cleanAppName(input) {
  if (!input) return "Unknown";

  let title = "";
  let processName = "";

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      title = parsed.title || "";
      processName = parsed.processName || "";
    } catch {
      title = input;
    }
  } else {
    title = input.title || "";
    processName = input.processName || "";
  }

  const text = `${title} ${processName}`.toLowerCase();
  const proc = processName.toLowerCase();

  const detectBrowserSite = () => {
    if (text.includes("youtube")) return "YouTube";
    if (text.includes("instagram")) return "Instagram";
    if (text.includes("facebook")) return "Facebook";
    if (text.includes("whatsapp")) return "WhatsApp";
    if (text.includes("twitter") || text.includes("x.com")) return "Twitter / X";
    if (text.includes("linkedin")) return "LinkedIn";
    if (text.includes("github")) return "GitHub";
    if (text.includes("chatgpt")) return "ChatGPT";
    if (text.includes("stackoverflow") || text.includes("stack overflow")) return "Stack Overflow";
    if (text.includes("leetcode")) return "LeetCode";
    if (text.includes("geeksforgeeks")) return "GeeksforGeeks";
    if (text.includes("netflix")) return "Netflix";
    if (text.includes("prime video")) return "Prime Video";
    if (text.includes("hotstar")) return "Hotstar";
    return null;
  };

  if (proc.includes("chrome")) {
    return detectBrowserSite() || "Chrome";
  }

  if (proc.includes("msedge")) {
    return detectBrowserSite() || "Microsoft Edge";
  }

  if (proc.includes("firefox")) {
    return detectBrowserSite() || "Firefox";
  }

  if (proc.includes("brave")) {
    return detectBrowserSite() || "Brave";
  }

  if (proc.includes("spotify")) return "Spotify";
  if (proc.includes("code")) return "VS Code";
  if (proc.includes("postman")) return "Postman";
  if (proc.includes("notion")) return "Notion";
  if (proc.includes("powershell")) return "PowerShell";
  if (proc.includes("cmd")) return "Command Prompt";
  if (proc.includes("winword")) return "Word";
  if (proc.includes("excel")) return "Excel";
  if (proc.includes("powerpnt")) return "PowerPoint";
  if (proc.includes("explorer")) return "File Explorer";

  if (text.includes("visual studio code") || text.includes("vs code")) return "VS Code";
  if (text.includes("spotify")) return "Spotify";
  if (text.includes("postman")) return "Postman";
  if (text.includes("notion")) return "Notion";
  if (text.includes("word")) return "Word";
  if (text.includes("excel")) return "Excel";
  if (text.includes("powerpoint")) return "PowerPoint";

  return (
    title
      .replace(/^\d+\s*/, "")
      .replace(/\s-\sGoogle Chrome$/i, "")
      .replace(/\s-\sMicrosoft Edge$/i, "")
      .replace(/\s-\sMozilla Firefox$/i, "")
      .replace(/\s-\sVisual Studio Code$/i, "")
      .replace(/\s-\s.*$/, "")
      .trim() || "Unknown"
  );
}

function getCategory(input) {
  const text = getText(input);

  const productive = [
    "github",
    "chatgpt",
    "linkedin",
    "visual studio",
    "vs code",
    "code",
    "postman",
    "notion",
    "terminal",
    "powershell",
    "cmd",
    "stackoverflow",
    "stack overflow",
    "leetcode",
    "geeksforgeeks",
    "tutorial",
    "docs",
    "documentation",
    "react",
    "javascript",
    "node",
    "python",
    "coding",
    "study",
    "course",
    "lecture",
    "assignment",
    "research",
    "word",
    "excel",
    "powerpoint"
  ];

  const distracting = [
    "spotify",
    "youtube",
    "instagram",
    "facebook",
    "whatsapp",
    "twitter",
    "x.com",
    "reels",
    "shorts",
    "netflix",
    "prime video",
    "hotstar",
    "movie",
    "gaming",
    "song",
    "music"
  ];

  if (text.includes("youtube")) {
    if (productive.some((item) => text.includes(item))) {
      return "productive";
    }

    return "distracting";
  }

  if (distracting.some((item) => text.includes(item))) {
    return "distracting";
  }

  if (productive.some((item) => text.includes(item))) {
    return "productive";
  }

  return "neutral";
}

function getActiveWindow() {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "tracker.ps1");

    exec(
      `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`,
      (error, stdout) => {
        if (error) return reject(error);
        resolve(stdout.trim());
      }
    );
  });
}

async function trackUsage() {
  try {
    const config = getConfig();

    if (!config.enabled) {
      return;
    }

    const activeWindow = await getActiveWindow();
    if (!activeWindow) return;

    const cleanName = cleanAppName(activeWindow);

    if (!currentApp) {
      currentApp = activeWindow;
      startTime = Date.now();
      console.log("Started:", cleanName);
      return;
    }

    if (currentApp === activeWindow) {
      if (!usageMap[cleanName]) {
        usageMap[cleanName] = {
          seconds: 0,
          rawTitle: activeWindow
        };
      }

      usageMap[cleanName].seconds += TRACK_INTERVAL / 1000;
      usageMap[cleanName].rawTitle = activeWindow;
      return;
    }

    const secondsSpent = Math.floor((Date.now() - startTime) / 1000);
    const oldCleanName = cleanAppName(currentApp);

    if (!usageMap[oldCleanName]) {
      usageMap[oldCleanName] = {
        seconds: 0,
        rawTitle: currentApp
      };
    }

    usageMap[oldCleanName].seconds += secondsSpent;

    console.log(`Switch: ${oldCleanName} -> ${cleanName}`);

    currentApp = activeWindow;
    startTime = Date.now();
  } catch (error) {
    console.log("TRACK ERROR:", error.message);
  }
}

async function flushUsage() {
  try {
    const config = getConfig();

    if (!config.enabled) return;

    if (!config.token) {
      console.log("No token found");
      return;
    }

    for (const appName in usageMap) {
      const data = usageMap[appName];

      if (data.seconds < 15) continue;

      await axios.post(
        API_URL,
        {
          app_name: appName,
          time_spent: Math.max(1, Math.round(data.seconds / 60)),
          category: getCategory(data.rawTitle),
          source: "auto"
        },
        {
          headers: {
            Authorization: `Bearer ${config.token}`
          }
        }
      );

      console.log(
        `Saved: ${appName} | ${getCategory(data.rawTitle)} | ${Math.round(
          data.seconds / 60
        )} min`
      );
    }

    usageMap = {};
  } catch (error) {
    console.error("Flush error:", error.message);
  }
}

app.whenReady().then(() => {
  console.log("Tracker started");
  setInterval(trackUsage, TRACK_INTERVAL);
  setInterval(flushUsage, SAVE_INTERVAL);
});

app.on("before-quit", async () => {
  await flushUsage();
});