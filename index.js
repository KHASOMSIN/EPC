const http = require("http");
require("dotenv").config(); // Load environment variables
const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./database/dbConnection"); // Import database connection
const { getAllUsers } = require("./model/getusers"); // Adjust import based on your file export
const register = require("./model/register");
const verifyOtp = require("./model/verifyOtp");

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
    const users = await getAllUsers(); // Fetch users using the model function
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// register
app.use("/auth", register);
// verify code
app.use("/auth", verifyOtp);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
