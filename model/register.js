const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const db = require("../database/dbConnection");
const router = express.Router();
const saltRounds = 10;

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "khasomsin@gmail.com",
    pass: "vxtf ondu fdla rfwa",
  },
});

// User Registration
router.post("/register", (req, res) => {
  const { fullname, password, email } = req.body;

  // Debugging statements
  console.log("Received registration request with data:", req.body);

  // Input validation
  if (!fullname || !password || !email) {
    console.error("Missing required fields:", { fullname, password, email });
    return res.status(400).send("All fields are required");
  }

  // Check if user already exists
  const checkUserQuery = "SELECT * FROM users WHERE fullname = ? OR email = ?";
  db.query(checkUserQuery, [fullname, email], (err, results) => {
    if (err) {
      console.error("Database error during user check:", err);
      return res.status(500).send("Database error");
    }
    if (results.length > 0) {
      return res.status(400).send("Username or email already exists");
    }

    // Hash the password
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).send("Error hashing password");
      }

      // Generate 4-digit OTP and password token
      const otp = crypto.randomInt(1000, 9999);
      const otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes from now
      const passwordToken = crypto.randomBytes(32).toString("hex");

      // Insert the new user and OTP into the database
      const query =
        "INSERT INTO users (fullname, password, email, otp, otp_expires, password_token) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(
        query,
        [fullname, hashedPassword, email, otp, otpExpires, passwordToken],
        (err, result) => {
          if (err) {
            console.error("Database error during user insert:", err);
            return res.status(500).send("Database error");
          }

          // Send OTP email
          const mailOptions = {
            from: "khasomsin@gmail.com",
            to: email,
            subject: "OTP for Email Verification",
            text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
          };

          transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              console.error("Error sending OTP email:", err);
              return res.status(500).send("Error sending OTP email");
            }
            res
              .status(201)
              .send(
                "User registered successfully. Please check your email for the OTP."
              );
          });
        }
      );
    });
  });
});

module.exports = router;
