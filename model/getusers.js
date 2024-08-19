const pool = require("../database/dbConnection"); // Adjust the path to your database connection file

// Function to get all users
const getAllUsers = async () => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows; // Return an array of user objects
  } catch (error) {
    console.error("Error fetching users:", error.message);
    throw new Error("Error fetching users");
  }
};
module.exports = {
  getAllUsers,
};
