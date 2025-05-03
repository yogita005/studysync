import { query } from '../database/db.js';

export async function getTasks(userId) {
  try {
    const sql = `
      SELECT * FROM tasks
      WHERE user_id = ?
      ORDER BY due_date ASC, priority DESC
    `;
    
    const tasks = await query(sql, [userId]);
    return tasks;
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
}

export async function createTask(userId, title, dueDate, priority) {
  try {
    const sql = `
      INSERT INTO tasks (user_id, title, due_date, priority)
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await query(sql, [userId, title, dueDate, priority]);
    return { id: result.insertId, title };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

export async function updateTaskCompletion(taskId, userId, completed) {
  try {
    const sql = `
      UPDATE tasks
      SET 
        completed = ?,
        completed_at = ${completed ? 'CURRENT_TIMESTAMP' : 'NULL'}
      WHERE id = ? AND user_id = ?
    `;
    
    await query(sql, [completed, taskId, userId]);
    return { success: true };
  } catch (error) {
    console.error('Error updating task completion:', error);
    throw error;
  }
}