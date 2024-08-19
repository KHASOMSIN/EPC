const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/dbConnection"); // Ensure this path is correct

const router = express.Router();

// Secret key should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret_key";

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      message: "error",
      status: 400,
      data: {
        message: "Email and password are required",
      },
    });
  }

  const query = "SELECT * FROM users WHERE email = ?";

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Database error during login:", err);
      return res.status(500).json({
        message: "error",
        status: 500,
        data: {
          message: "Server error",
        },
      });
    }

    if (results.length === 0) {
      return res.status(400).json({
        message: "error",
        status: 400,
        data: {
          message: "Invalid email or password",
        },
      });
    }

    const user = results[0];

    // Check if the user has verified their email
    if (!user.is_verified) {
      return res.status(400).json({
        message: "error",
        status: 400,
        data: {
          message: "Your account is not verified. Please verify your account.",
        },
      });
    }

    // Check password validity
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "error",
        status: 400,
        data: {
          message: "Invalid email or password",
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "success",
      status: 200,
      data: {
        jwt: {
          access_token: token,
          token_type: "bearer",
          expires_in: 3600,
        },
      },
    });
  });
});

module.exports = router;
