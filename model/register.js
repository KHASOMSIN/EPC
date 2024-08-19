require("dotenv").config(); // Load environment variables
const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const db = require("../database/dbConnection"); // Update path if necessary
const router = express.Router();
const saltRounds = 10;

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// User Registration
router.post("/register", async (req, res) => {
  const { fullname, password, email } = req.body;

  console.log("Received registration request with data:", req.body);

  if (!fullname || !password || !email) {
    console.error("Missing required fields:", { fullname, password, email });
    return res.status(400).send("All fields are required");
  }

  try {
    // Check if user already exists
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE fullname = ? OR email = ?",
      [fullname, email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).send("Username or email already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate OTP and password token
    const otp = crypto.randomInt(1000, 9999);
    const otpExpires = new Date(Date.now() + 10 * 60000);
    const passwordToken = crypto.randomBytes(32).toString("hex");

    // Insert the new user
    const [result] = await db.query(
      "INSERT INTO users (fullname, password, email, otp, otp_expires, password_token) VALUES (?, ?, ?, ?, ?, ?)",
      [fullname, hashedPassword, email, otp, otpExpires, passwordToken]
    );

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP for Email Verification",
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(201)
      .send(
        "User registered successfully. Please check your email for the OTP."
      );
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
