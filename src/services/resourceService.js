import { query } from '../database/db.js';

export async function getResources(searchQuery = '') {
  try {
    let sql = `
      SELECT 
        r.*, 
        c.name as course_name, 
        u.username as uploaded_by,
        COALESCE(AVG(rt.rating), 0) as average_rating
      FROM resources r
      JOIN courses c ON r.course_id = c.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN ratings rt ON r.id = rt.resource_id
    `;
    
    const params = [];
    
    if (searchQuery) {
      sql += ` WHERE r.title LIKE ? OR c.name LIKE ?`;
      params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }
    
    sql += ` GROUP BY r.id ORDER BY r.upload_date DESC`;
    
    const resources = await query(sql, params);
    return resources;
  } catch (error) {
    console.error('Error getting resources:', error);
    throw error;
  }
}

export async function uploadResource(title, courseId, userId, filePath, fileType, description = '') {
  try {
    const sql = `
      INSERT INTO resources 
      (title, course_id, user_id, file_path, file_type, description) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [title, courseId, userId, filePath, fileType, description]);
    return { id: result.insertId, title };
  } catch (error) {
    console.error('Error uploading resource:', error);
    throw error;
  }
}

export async function rateResource(resourceId, userId, rating, comment = '') {
  try {
    // Check if user has already rated this resource
    const checkSql = `SELECT * FROM ratings WHERE resource_id = ? AND user_id = ?`;
    const existing = await query(checkSql, [resourceId, userId]);
    
    let result;
    if (existing.length > 0) {
      // Update existing rating
      const updateSql = `
        UPDATE ratings 
        SET rating = ?, comment = ? 
        WHERE resource_id = ? AND user_id = ?
      `;
      result = await query(updateSql, [rating, comment, resourceId, userId]);
    } else {
      // Insert new rating
      const insertSql = `
        INSERT INTO ratings 
        (resource_id, user_id, rating, comment) 
        VALUES (?, ?, ?, ?)
      `;
      result = await query(insertSql, [resourceId, userId, rating, comment]);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error rating resource:', error);
    throw error;
  }
}