const bcrypt = require("bcrypt");
const { pool, sql } = require("../config/db");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashedPassword)
      .query(`
        INSERT INTO Users (name, email, password)
        VALUES (@name, @email, @password)
      `);

    res.status(201).json({ message: "User registered successfully ✅" });

  }
  // catch (error) {
  //   res.status(500).json({ error: error.message });
  // }
  catch(error){
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Registration failed ❌" });
    next(error);
  }
};

//  login controller
exports.login = async (req, res,next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM Users WHERE email = @email");

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: "User not found ❌" });
    }

    const user = result.recordset[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password ❌" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful ✅",
    "token": token,
    "user": {
      "id": user.id,
      "name": user.name,
      "email": user.email
    }
  });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Login failed ❌" });
    next(error);
  }
};

//Get profile
exports.getProfile = async (req, res) => {
  try {
    const result = await pool.request()
      .input("id", sql.Int, req.user.id)
      .query(`
        SELECT id, name, email
        FROM Users
        WHERE id = @id
      `);

    res.json(result.recordset[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//Uptade Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    await pool.request()
      .input("id", sql.Int, req.user.id)
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .query(`
        UPDATE Users
        SET name = @name, email = @email
        WHERE id = @id
      `);

    res.json({ message: "Profile updated ✅" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await pool.request()
      .input("id", sql.Int, req.user.id)
      .query("SELECT * FROM Users WHERE id = @id");

    const user = result.recordset[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong current password ❌" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.request()
      .input("id", sql.Int, req.user.id)
      .input("password", sql.VarChar, hashedPassword)
      .query(`
        UPDATE Users
        SET password = @password
        WHERE id = @id
      `);

    res.json({ message: "Password updated ✅" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    await pool.request()
      .input("id", sql.Int, req.user.id)
      .query("DELETE FROM Users WHERE id = @id");

    res.json({ message: "Account deleted Successfully ✅" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
