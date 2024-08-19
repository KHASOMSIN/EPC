// database connection
const mysql = require("mysql2/promise");

// Create a pool of connections
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection to the database
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection successful");
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    process.exit(1); // Exit the process with an error code
  }
};

// Call the testConnection function when the module is imported
testConnection();

module.exports = pool;
