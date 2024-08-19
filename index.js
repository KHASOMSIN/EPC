// index.js
require("dotenv").config(); // Load environment variables
const bcrypt = require("bcryptjs");
const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./database/dbConnection"); // Import database connection
const getAllUsers = require("./model/getusers");

const app = express();

// Middleware
app.use(bodyParser.json());

// Example route for testing
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Example route for fetching users
app.get("/users", async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
