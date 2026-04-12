const { pool, sql } = require("../config/db");

// Add Usage
exports.addUsage = async (req, res) => {
  try {
    const { app_name, time_spent, category } = req.body;
    const user_id = req.user.id;

    await pool.request()
      .input("user_id", sql.Int, user_id)
      .input("app_name", sql.VarChar, app_name)
      .input("time_spent", sql.Int, time_spent)
      .input("category", sql.VarChar, category)
      .query(`
        INSERT INTO Usage (user_id, app_name, time_spent, category)
        VALUES (@user_id, @app_name, @time_spent, @category)
      `);

    res.status(201).json({ success: true, message: "Usage added ✅" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get All Usage
exports.getUsage = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.request()
      .input("user_id", sql.Int, user_id)
      .query(`
        SELECT * FROM Usage
        WHERE user_id = @user_id
        ORDER BY usage_date DESC
      `);

    res.json(result.recordset);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Today Total
exports.getTodayTotal = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.request()
      .input("user_id", sql.Int, user_id)
      .query(`
        SELECT SUM(time_spent) AS total_time
        FROM Usage
        WHERE user_id = @user_id
        AND CAST(usage_date AS DATE) = CAST(GETDATE() AS DATE)
      `);

    res.json(result.recordset[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// App Summary
exports.getAppSummary = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.request()
      .input("user_id", sql.Int, user_id)
      .query(`
        SELECT app_name, SUM(time_spent) AS total_time
        FROM Usage
        WHERE user_id = @user_id
        GROUP BY app_name
      `);

    res.json(result.recordset);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//Today App Summary
exports.getTodaySummary = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.request()
      .input("user_id", sql.Int, user_id)
      .query(`
        SELECT
          app_name,
          SUM(time_spent) AS total_time
        FROM Usage
        WHERE user_id = @user_id
        AND CAST(usage_date AS DATE) = CAST(GETDATE() AS DATE)
        GROUP BY app_name
      `);

    const totalScreenTime = result.recordset.reduce(
      (sum, row) => sum + (row.total_time || 0),
      0
    );

    res.json({
      totalScreenTime,
      appCount: result.recordset.length,
      apps: result.recordset
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
//Get Weekly Summary
exports.getWeeklyReport = async (req, res) => {
  try {
    const user_id = req.user.id;

    // 1️⃣ Daily breakdown
    const weeklyResult = await pool.request()
      .input("user_id", sql.Int, user_id)
      .query(`
        SELECT
          CAST(usage_date AS DATE) AS usage_day,
          SUM(time_spent) AS total_time
        FROM Usage
        WHERE user_id = @user_id
        AND usage_date >= DATEADD(DAY, -6, GETDATE())
        GROUP BY CAST(usage_date AS DATE)
        ORDER BY usage_day
      `);

    const dailyData = weeklyResult.recordset;

    const totalWeekTime = dailyData.reduce(
      (sum, row) => sum + (row.total_time || 0),
      0
    );

    const averageDaily = dailyData.length
      ? Math.round(totalWeekTime / dailyData.length)
      : 0;

    // 2️⃣ Most used app
    const topAppResult = await pool.request()
      .input("user_id", sql.Int, user_id)
      .query(`
        SELECT TOP 1 app_name, SUM(time_spent) AS total_time
        FROM Usage
        WHERE user_id = @user_id
        AND usage_date >= DATEADD(DAY, -6, GETDATE())
        GROUP BY app_name
        ORDER BY total_time DESC
      `);

    const mostUsedApp = topAppResult.recordset[0] || null;

    res.json({
      totalWeekTime,
      averageDaily,
      mostUsedApp,
      dailyData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
//Productivity Score
exports.getProductivityScore = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.request()
      .input("user_id", sql.Int, user_id)
      .query(`
        SELECT
          SUM(time_spent) AS totalTime,
          SUM(CASE
              WHEN category = 'productive' THEN time_spent
              ELSE 0
          END) AS productiveTime
        FROM Usage
        WHERE user_id = @user_id
        AND usage_date >= DATEADD(DAY, -6, GETDATE())
      `);

    const data = result.recordset[0];

    const totalTime = data.totalTime || 0;
    const productiveTime = data.productiveTime || 0;

    const score = totalTime > 0
      ? Math.round((productiveTime / totalTime) * 100)
      : 0;

    res.status(200).json({
      totalTime,
      productiveTime,
      productivityScore: score
    });

  } catch (error) {
    console.error("Productivity Error:", error);
    res.status(500).json({ error: error.message });
  }
};
//Weekly Graph Data

exports.getWeeklyGraph = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.request()
      .input("user_id", sql.Int, user_id)
      .query(`
        SELECT
          CAST(usage_date AS DATE) AS usageDate,
          SUM(time_spent) AS totalTime,
          SUM(CASE
              WHEN category = 'productive' THEN time_spent
              ELSE 0
          END) AS productiveTime
        FROM Usage
        WHERE user_id = @user_id
        AND usage_date >= DATEADD(DAY, -6, GETDATE())
        GROUP BY CAST(usage_date AS DATE)
        ORDER BY usageDate ASC
      `);

    res.status(200).json(result.recordset);

  } catch (error) {
    console.error("Weekly Graph Error:", error);
    res.status(500).json({ error: error.message });
  }
};
//Clear Usages
exports.clearUsage = async (req, res) => {
  try {
    await pool.request()
      .input("user_id", sql.Int, req.user.id)
      .query("DELETE FROM Usage WHERE user_id = @user_id");

    res.json({ message: "Usage cleared ✅" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
