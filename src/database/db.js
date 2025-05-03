import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',  // Default to empty string if not provided
  database: process.env.DB_NAME || 'studysync1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('Attempting to connect to MySQL with:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database
  // Don't log the password for security reasons
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Export pool and helper functions
export { pool, testConnection };

// Helper function to execute queries
export async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}