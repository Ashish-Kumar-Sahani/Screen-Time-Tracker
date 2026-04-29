const sql = require("mssql");
const { Pool } = require("pg");
require("dotenv").config();

const DB_TYPE = process.env.DB_TYPE || "mssql";

//   SQL SERVER CONFIG
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: true,
    trustServerCertificate: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
};
//   POSTGRES CONFIG
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PG_SSL === "true"
    ? { rejectUnauthorized: false }
    : false
});
//   SINGLETON POOLS
let sqlPool = null;
//   CORE DB CONNECT FUNCTION
const getDB = async () => {
  try {
    const DB_TYPE = process.env.DB_TYPE || "mssql";

    if (DB_TYPE === "postgres") {
      console.log("Using PostgreSQL 🐘");
      return pgPool;
    }

    if (!sqlPool) {
      sqlPool = await sql.connect(sqlConfig);
      console.log("Using SQL Server 🧱");
     
    }

    return sqlPool;

  } catch (err) {
    console.error("DB Connection Error ❌", err);
    throw err;
  }
};

/* =========================
   BACKWARD COMPATIBILITY
   (IMPORTANT FOR YOUR CONTROLLERS)
========================= */

// controllers use getPool() → so we keep it
const getPool = getDB;
//   EXPORTS
module.exports = {
  sql,
  getDB,
  getPool   // for backward compatibility with existing controllers
};