const { pool, sql } = require("../config/db");

exports.setLimit = async (req, res) => {
  try {
    const { app_name, daily_limit } = req.body;
    const user_id = req.user.id;

    const request = pool.request();
    request.input("user_id", sql.Int, user_id);
    request.input("app_name", sql.VarChar, app_name);
    request.input("daily_limit", sql.Int, daily_limit);

    await request.query(`
      IF EXISTS (SELECT 1 FROM Limits WHERE user_id=@user_id AND app_name=@app_name)
      BEGIN
          UPDATE Limits
          SET daily_limit=@daily_limit
          WHERE user_id=@user_id AND app_name=@app_name
      END
      ELSE
      BEGIN
          INSERT INTO Limits (user_id, app_name, daily_limit)
          VALUES (@user_id, @app_name, @daily_limit)
      END
    `);

    res.json({ message: "Limit saved successfully ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// NEW
exports.getLimits = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.request()
      .input("user_id", sql.Int, user_id)
      .query(`
        SELECT * FROM Limits
        WHERE user_id = @user_id
        ORDER BY app_name ASC
      `);

    res.status(200).json(result.recordset);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
exports.getLimitStatus = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.request()
      .input("user_id", sql.Int, user_id)
      .query(`
        SELECT 
          l.app_name,
          l.daily_limit,
          ISNULL(SUM(
            CASE 
              WHEN CAST(u.usage_date AS DATE) = CAST(GETDATE() AS DATE)
              THEN u.time_spent
              ELSE 0
            END
          ), 0) AS today_usage
        FROM Limits l
        LEFT JOIN Usage u
          ON l.user_id = u.user_id
          AND l.app_name = u.app_name
        WHERE l.user_id = @user_id
        GROUP BY l.app_name, l.daily_limit
        ORDER BY l.app_name
      `);

    const data = result.recordset.map((item) => {
      let status = "safe";

      if (item.today_usage >= item.daily_limit) {
        status = "exceeded";
      } else if (item.today_usage >= item.daily_limit * 0.8) {
        status = "warning";
      }

      return {
        ...item,
        status
      };
    });

    res.status(200).json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};