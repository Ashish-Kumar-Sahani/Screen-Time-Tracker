const { getPool, sql } = require("../config/db");

const isPostgres = process.env.DB_TYPE === "postgres";

/* =========================
   COMMON QUERY RUNNER
========================= */
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

/* =========================
   SET LIMIT (UPSERT)
========================= */
exports.setLimit = async (req, res) => {
  try {
    const { app_name, daily_limit } = req.body;
    const user_id = req.user.id;
    const pool = await getPool();

    if (isPostgres) {
      await runQuery(
        pool,
        `INSERT INTO limits (user_id, app_name, daily_limit)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, app_name)
         DO UPDATE SET daily_limit = EXCLUDED.daily_limit`,
        [user_id, app_name, daily_limit]
      );
    } else {
      await runQuery(
        pool,
        `IF EXISTS (SELECT 1 FROM Limits WHERE user_id=@user_id AND app_name=@app_name)
         BEGIN
           UPDATE Limits
           SET daily_limit=@daily_limit
           WHERE user_id=@user_id AND app_name=@app_name
         END
         ELSE
         BEGIN
           INSERT INTO Limits (user_id, app_name, daily_limit)
           VALUES (@user_id, @app_name, @daily_limit)
         END`,
        [
          { name: "user_id", type: sql.Int, value: user_id },
          { name: "app_name", type: sql.VarChar, value: app_name },
          { name: "daily_limit", type: sql.Int, value: daily_limit }
        ]
      );
    }

    res.json({ message: "Limit saved successfully ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   GET ALL LIMITS
========================= */
exports.getLimits = async (req, res) => {
  try {
    const user_id = req.user.id;
    const pool = await getPool();

    const data = isPostgres
      ? await runQuery(
          pool,
          `SELECT * FROM limits
           WHERE user_id = $1
           ORDER BY app_name ASC`,
          [user_id]
        )
      : await runQuery(
          pool,
          `SELECT * FROM Limits
           WHERE user_id = @user_id
           ORDER BY app_name ASC`,
          [{ name: "user_id", type: sql.Int, value: user_id }]
        );

    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   LIMIT STATUS (TODAY USAGE + LIMIT)
========================= */
exports.getLimitStatus = async (req, res) => {
  try {
    const user_id = req.user.id;
    const pool = await getPool();

    const data = isPostgres
      ? await runQuery(
          pool,
          `SELECT 
              l.app_name,
              l.daily_limit,
              COALESCE(SUM(
                CASE 
                  WHEN DATE(u.usage_date) = CURRENT_DATE 
                  THEN u.time_spent
                  ELSE 0
                END
              ), 0) AS today_usage
           FROM limits l
           LEFT JOIN usage u
             ON l.user_id = u.user_id
             AND l.app_name = u.app_name
           WHERE l.user_id = $1
           GROUP BY l.app_name, l.daily_limit
           ORDER BY l.app_name`,
          [user_id]
        )
      : await runQuery(
          pool,
          `SELECT 
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
           ORDER BY l.app_name`,
          [{ name: "user_id", type: sql.Int, value: user_id }]
        );

    // 🔥 SAME LOGIC AS BEFORE
    const result = data.map(item => {
      const today_usage = Number(item.today_usage) || 0;
      const daily_limit = Number(item.daily_limit) || 0;

      let status = "safe";

      if (today_usage >= daily_limit) {
        status = "exceeded";
      } else if (today_usage >= daily_limit * 0.8) {
        status = "warning";
      }

      return {
        app_name: item.app_name,
        daily_limit,
        today_usage,
        status
      };
    });

    res.status(200).json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};