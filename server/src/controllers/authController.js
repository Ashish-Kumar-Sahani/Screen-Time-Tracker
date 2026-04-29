const bcrypt = require("bcrypt");
const { getPool, sql } = require("../config/db");
const jwt = require("jsonwebtoken");

const isPostgres = process.env.DB_TYPE === "postgres";

/* =========================
   REGISTER
========================= */
exports.register = async (req, res) => {
  try {
    const pool = await getPool();
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    if (isPostgres) {
      await pool.query(
        `INSERT INTO users (name, email, password)
         VALUES ($1, $2, $3)`,
        [name, email, hashedPassword]
      );
    } else {
      await pool.request()
        .input("name", sql.VarChar, name)
        .input("email", sql.VarChar, email)
        .input("password", sql.VarChar, hashedPassword)
        .query(`
          INSERT INTO Users (name, email, password)
          VALUES (@name, @email, @password)
        `);
    }

    res.status(201).json({ message: "User registered ✔" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Registration failed ❌" });
  }
};

/* =========================
   LOGIN
========================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await getPool();

    let user;

    if (isPostgres) {
      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: "User not found ❌" });
      }

      user = result.rows[0];

    } else {
      const result = await pool.request()
        .input("email", sql.VarChar, email)
        .query("SELECT * FROM Users WHERE email = @email");

      if (result.recordset.length === 0) {
        return res.status(401).json({ message: "User not found ❌" });
      }

      user = result.recordset[0];
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password ❌" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful ✅",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed ❌" });
  }
};

/* =========================
   GET PROFILE
========================= */
exports.getProfile = async (req, res) => {
  try {
    const pool = await getPool();

    if (isPostgres) {
      const result = await pool.query(
        "SELECT id, name, email FROM users WHERE id = $1",
        [req.user.id]
      );
      return res.json(result.rows[0]);
    } else {
      const result = await pool.request()
        .input("id", sql.Int, req.user.id)
        .query(`
          SELECT id, name, email
          FROM Users
          WHERE id = @id
        `);

      return res.json(result.recordset[0]);
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   UPDATE PROFILE
========================= */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const pool = await getPool();

    if (isPostgres) {
      await pool.query(
        `UPDATE users SET name = $1, email = $2 WHERE id = $3`,
        [name, email, req.user.id]
      );
    } else {
      await pool.request()
        .input("id", sql.Int, req.user.id)
        .input("name", sql.VarChar, name)
        .input("email", sql.VarChar, email)
        .query(`
          UPDATE Users
          SET name = @name, email = @email
          WHERE id = @id
        `);
    }

    res.json({ message: "Profile updated ✅" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   CHANGE PASSWORD
========================= */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const pool = await getPool();

    let user;

    if (isPostgres) {
      const result = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [req.user.id]
      );
      user = result.rows[0];
    } else {
      const result = await pool.request()
        .input("id", sql.Int, req.user.id)
        .query("SELECT * FROM Users WHERE id = @id");
      user = result.recordset[0];
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong current password ❌" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (isPostgres) {
      await pool.query(
        "UPDATE users SET password = $1 WHERE id = $2",
        [hashedPassword, req.user.id]
      );
    } else {
      await pool.request()
        .input("id", sql.Int, req.user.id)
        .input("password", sql.VarChar, hashedPassword)
        .query(`
          UPDATE Users
          SET password = @password
          WHERE id = @id
        `);
    }

    res.json({ message: "Password updated ✅" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   DELETE ACCOUNT
========================= */
exports.deleteAccount = async (req, res) => {
  try {
    const pool = await getPool();

    if (isPostgres) {
      await pool.query("DELETE FROM users WHERE id = $1", [req.user.id]);
    } else {
      await pool.request()
        .input("id", sql.Int, req.user.id)
        .query("DELETE FROM Users WHERE id = @id");
    }

    res.json({ message: "Account deleted Successfully ✅" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};