const sql = require("mssql");
const { Pool } = require("pg");

const isPostgres = !!process.env.POSTGRES_URI;

// PostgreSQL pool
const pgPool = isPostgres
  ? new Pool({
      connectionString: process.env.POSTGRES_URI,
      ssl: { rejectUnauthorized: false },
      family: 4, // IPv4 fix
    })
  : null;

// Universal query runner
const runQuery = async (pool, query, params = []) => {
  if (isPostgres) {
    const result = await pgPool.query(query, params);
    return result.rows;
  } else {
    const request = pool.request();
    params.forEach((p) => {
      request.input(p.name, p.type, p.value);
    });
    const result = await request.query(query);
    return result.recordset;
  }
};

module.exports = { runQuery, isPostgres };