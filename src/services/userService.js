import { query } from '../database/db.js';
import bcrypt from 'bcrypt';

export async function registerUser(username, email, password) {
  try {
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert user into database
    const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    const result = await query(sql, [username, email, hashedPassword]);
    
    return { id: result.insertId, username, email };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

export async function loginUser(email, password) {
  try {
    // Get user from database
    const sql = `SELECT * FROM users WHERE email = ?`;
    const users = await query(sql, [email]);
    
    if (users.length === 0) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    const user = users[0];
    
    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}