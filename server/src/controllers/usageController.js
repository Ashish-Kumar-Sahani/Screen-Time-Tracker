const { getPool, sql } = require("../config/db");

const isPostgres = process.env.DB_TYPE === "postgres";
//   HELPER QUERY FUNCTION

const runQuery = async (pool, query, params = []) => {
  if (isPostgres) {
    const result = await pool.query(query, params);
    return result.rows;
  } else {
    const request = pool.request();
    params.forEach(p => {
      request.input(p.name, p.type, p.value);
    });
    const result = await request.query(query);
    return result.recordset;
  }
};

//   ADD USAGE
/*=============================
Recent Update :Added source field to track whether the usage was added manually or tracked automatically
============================= */
exports.addUsage = async (req, res) => {
  try {
    const { app_name, time_spent, category, source = "manual" } = req.body;
    const user_id = req.user.id;
    const pool = await getPool();

    if (isPostgres) {
      if (source === "auto") {
        const existing = await runQuery(
          pool,
          `SELECT id FROM usage
           WHERE user_id = $1
           AND app_name = $2
           AND source = 'auto'
           AND DATE(usage_date) = CURRENT_DATE
           LIMIT 1`,
          [user_id, app_name]
        );

        if (existing.length > 0) {
          await runQuery(
            pool,
            `UPDATE usage
             SET time_spent = time_spent + $1,
                 category = $2
             WHERE id = $3`,
            [time_spent, category, existing[0].id]
          );
        } else {
          await runQuery(
            pool,
            `INSERT INTO usage
             (user_id, app_name, time_spent, usage_date, category, source)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [user_id, app_name, time_spent, new Date(), category, source]
          );
        }
      } else {
        await runQuery(
          pool,
          `INSERT INTO usage
           (user_id, app_name, time_spent, usage_date, category, source)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user_id, app_name, time_spent, new Date(), category, source]
        );
      }
    } else {
      if (source === "auto") {
        const existing = await runQuery(
          pool,
          `SELECT TOP 1 id FROM Usage
           WHERE user_id = @user_id
           AND app_name = @app_name
           AND source = 'auto'
           AND CAST(usage_date AS DATE) = CAST(GETDATE() AS DATE)`,
          [
            { name: "user_id", type: sql.Int, value: user_id },
            { name: "app_name", type: sql.VarChar, value: app_name }
          ]
        );

        if (existing.length > 0) {
          await runQuery(
            pool,
            `UPDATE Usage
             SET time_spent = time_spent + @time_spent,
                 category = @category
             WHERE id = @id`,
            [
              { name: "time_spent", type: sql.Int, value: time_spent },
              { name: "category", type: sql.VarChar, value: category },
              { name: "id", type: sql.Int, value: existing[0].id }
            ]
          );
        } else {
          await runQuery(
            pool,
            `INSERT INTO Usage
             (user_id, app_name, time_spent, category, source)
             VALUES (@user_id, @app_name, @time_spent, @category, @source)`,
            [
              { name: "user_id", type: sql.Int, value: user_id },
              { name: "app_name", type: sql.VarChar, value: app_name },
              { name: "time_spent", type: sql.Int, value: time_spent },
              { name: "category", type: sql.VarChar, value: category },
              { name: "source", type: sql.VarChar, value: source }
            ]
          );
        }
      } else {
        await runQuery(
          pool,
          `INSERT INTO Usage
           (user_id, app_name, time_spent, category, source)
           VALUES (@user_id, @app_name, @time_spent, @category, @source)`,
          [
            { name: "user_id", type: sql.Int, value: user_id },
            { name: "app_name", type: sql.VarChar, value: app_name },
            { name: "time_spent", type: sql.Int, value: time_spent },
            { name: "category", type: sql.VarChar, value: category },
            { name: "source", type: sql.VarChar, value: source }
          ]
        );
      }
    }

    res.json({ message: "Usage saved ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//   GET ALL USAGE
exports.getUsage = async (req, res) => {
  try {
    const pool = await getPool();
    const user_id = req.user.id;

    const data = isPostgres
      ? await runQuery(pool,
          `SELECT * FROM usage
           WHERE user_id = $1
           ORDER BY usage_date DESC`,
          [user_id])
      : await runQuery(pool,
          `SELECT * FROM Usage
           WHERE user_id = @user_id
           ORDER BY usage_date DESC`,
          [{ name: "user_id", type: sql.Int, value: user_id }]
        );

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//GET TODAY TOTAL
exports.getTodayTotal = async (req, res) => {
  try {
    const pool = await getPool();
    const user_id = req.user.id;

    const data = isPostgres
      ? await runQuery(
          pool,
          `SELECT 
              SUM(time_spent)::int AS total_time,
              SUM(
                CASE WHEN category='productive' THEN time_spent ELSE 0 END
              )::int AS productive_time
           FROM usage
           WHERE user_id = $1
           AND DATE(usage_date AT TIME ZONE 'Asia/Kolkata') = CURRENT_DATE`,
          [user_id]
        )
      : await runQuery(
          pool,
          `SELECT 
              SUM(time_spent) AS total_time,
              SUM(
                CASE WHEN category='productive' THEN time_spent ELSE 0 END
              ) AS productive_time
           FROM Usage
           WHERE user_id = @user_id
           AND CAST(usage_date AS DATE) = CAST(GETDATE() AS DATE)`,
          [{ name: "user_id", type: sql.Int, value: user_id }]
        );

    const row = data[0] || {};

    res.json({
      total_time: Number(row.total_time) || 0,
      productive_time: Number(row.productive_time) || 0
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//APP SUMMARY
exports.getAppSummary = async (req, res) => {
  try {
    const pool = await getPool();
    const user_id = req.user.id;

    const data = isPostgres
      ? await runQuery(
          pool,
          `SELECT app_name, SUM(time_spent) AS total_time
           FROM usage
           WHERE user_id = $1
           GROUP BY app_name`,
          [user_id]
        )
      : await runQuery(
          pool,
          `SELECT app_name, SUM(time_spent) AS total_time
           FROM Usage
           WHERE user_id = @user_id
           GROUP BY app_name`,
          [{ name: "user_id", type: sql.Int, value: user_id }]
        );

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//TODAY SUMMARY
exports.getTodaySummary = async (req, res) => {
  try {
    const pool = await getPool();
    const user_id = req.user.id;

    const data = isPostgres
      ? await runQuery(
          pool,
          `SELECT app_name, SUM(time_spent) AS total_time
          FROM usage
          WHERE user_id = $1
          AND usage_date >= CURRENT_DATE
          AND usage_date < CURRENT_DATE + INTERVAL '1 day'
          GROUP BY app_name`,
          [user_id]
        )
      : await runQuery(
          pool,
          `SELECT app_name, SUM(time_spent) AS total_time
           FROM Usage
           WHERE user_id = @user_id
           AND CAST(usage_date AS DATE) = CAST(GETDATE() AS DATE)
           GROUP BY app_name`,
          [{ name: "user_id", type: sql.Int, value: user_id }]
        );

  const totalScreenTime = data.reduce(
  (sum, row) => sum + Number(row.total_time || 0),
  0
);

    res.json({
      totalScreenTime,
      appCount: data.length,
      apps: data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//WEEKLY REPORT
exports.getWeeklyReport = async (req, res) => {
  try {
    const pool = await getPool();
    const user_id = req.user.id;

    const dailyData = isPostgres
      ? await runQuery(
          pool,
          `SELECT DATE(usage_date) AS usage_day,
                  SUM(time_spent) AS total_time
           FROM usage
           WHERE user_id = $1
           AND usage_date >= CURRENT_DATE - INTERVAL '6 days'
           GROUP BY DATE(usage_date)
           ORDER BY usage_day`,
          [user_id]
        )
      : await runQuery(
          pool,
          `SELECT CAST(usage_date AS DATE) AS usage_day,
                  SUM(time_spent) AS total_time
           FROM Usage
           WHERE user_id = @user_id
           AND usage_date >= DATEADD(DAY, -6, GETDATE())
           GROUP BY CAST(usage_date AS DATE)
           ORDER BY usage_day`,
          [{ name: "user_id", type: sql.Int, value: user_id }]
        );

const totalWeekTime = dailyData.reduce((sum, row) => {
  const value = row.total_time;

  const safeNumber =
    typeof value === "bigint"
      ? Number(value)
      : parseFloat(value) || 0;

  return sum + safeNumber;
}, 0);

    const averageDaily = dailyData.length
      ? Math.round(totalWeekTime / dailyData.length)
      : 0;

    const topApp = isPostgres
      ? await runQuery(
          pool,
          `SELECT app_name, SUM(time_spent) AS total_time
           FROM usage
           WHERE user_id = $1
           AND usage_date >= CURRENT_DATE - INTERVAL '6 days'
           GROUP BY app_name
           ORDER BY total_time DESC
           LIMIT 1`,
          [user_id]
        )
      : await runQuery(
          pool,
          `SELECT TOP 1 app_name, SUM(time_spent) AS total_time
           FROM Usage
           WHERE user_id = @user_id
           AND usage_date >= DATEADD(DAY, -6, GETDATE())
           GROUP BY app_name
           ORDER BY total_time DESC`,
          [{ name: "user_id", type: sql.Int, value: user_id }]
        );

    res.json({
      totalWeekTime,
      averageDaily,
      mostUsedApp: topApp[0] || null,
      dailyData
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
   //PRODUCTIVITY SCORE

exports.getProductivityScore = async (req, res) => {
  try {
    const user_id = req.user.id;
    const pool = await getPool();

    const data = isPostgres
      ? await runQuery(
          pool,
          `SELECT 
              SUM(time_spent)::int AS total_time,
              SUM(
                CASE WHEN category='productive' THEN time_spent ELSE 0 END
              )::int AS productive_time
           FROM usage
           WHERE user_id = $1
           AND usage_date >= NOW() - INTERVAL '6 days'`,
          [user_id]
        )
      : await runQuery(
          pool,
          `SELECT 
              SUM(time_spent) AS total_time,
              SUM(
                CASE WHEN category='productive' THEN time_spent ELSE 0 END
              ) AS productive_time
           FROM Usage
           WHERE user_id = @user_id
           AND usage_date >= DATEADD(DAY, -6, GETDATE())`,
          [{ name: "user_id", type: sql.Int, value: user_id }]
        );

    const row = data[0] || {};

    const totalTime = Number(row.total_time || row.totalTime) || 0;
    const productiveTime = Number(row.productive_time || row.productiveTime) || 0;

    const productivityScore = totalTime
      ? Math.round((productiveTime / totalTime) * 100)
      : 0;

    res.json({
      totalTime,
      productiveTime,
      productivityScore
    });

  } catch (error) {
    console.error("Productivity Error:", error);
    res.status(500).json({ error: error.message });
  }
};
  //WEEKLY GRAPH DATA
exports.getWeeklyGraph = async (req, res) => {
  try {
    const pool = await getPool();
    const user_id = req.user.id;

    const data = isPostgres
      ? await runQuery(
          pool,
          `SELECT
              DATE(usage_date) AS usage_date,
              SUM(time_spent)::int AS total_time,
              SUM(
                CASE WHEN category='productive' THEN time_spent ELSE 0 END
              )::int AS productive_time
           FROM usage
           WHERE user_id = $1
           GROUP BY DATE(usage_date)
           ORDER BY usage_date`,
          [user_id]
        )
      : await runQuery(
          pool,
          `SELECT
              CAST(usage_date AS DATE) AS usage_date,
              SUM(time_spent) AS total_time,
              SUM(
                CASE WHEN category='productive' THEN time_spent ELSE 0 END
              ) AS productive_time
           FROM Usage
           WHERE user_id = @user_id
           GROUP BY CAST(usage_date AS DATE)
           ORDER BY usage_date`,
          [{ name: "user_id", type: sql.Int, value: user_id }]
        );

    res.status(200).json(data);

  } catch (error) {
    console.error("Weekly Graph Error:", error);
    res.status(500).json({ error: error.message });
  }
};
//   CLEAR USAGE
exports.clearUsage = async (req, res) => {
  try {
    const pool = await getPool();
    const user_id = req.user.id;

    if (isPostgres) {
      await runQuery(pool, `DELETE FROM usage WHERE user_id=$1`, [user_id]);
    } else {
      await runQuery(pool,
        `DELETE FROM Usage WHERE user_id=@user_id`,
        [{ name: "user_id", type: sql.Int, value: user_id }]
      );
    }

    res.json({ message: "Usage cleared ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};