import { query } from '../database/db.js';

export async function getStudyGroups() {
  try {
    const sql = `
      SELECT 
        sg.*,
        c.name as course_name,
        u.username as created_by_user,
        COUNT(gm.user_id) as member_count
      FROM study_groups sg
      JOIN courses c ON sg.course_id = c.id
      JOIN users u ON sg.created_by = u.id
      LEFT JOIN group_members gm ON sg.id = gm.group_id
      GROUP BY sg.id
      ORDER BY sg.created_at DESC
    `;
    
    const groups = await query(sql);
    return groups;
  } catch (error) {
    console.error('Error getting study groups:', error);
    throw error;
  }
}

export async function createStudyGroup(name, courseId, userId) {
  try {
    // Create the group
    const createSql = `
      INSERT INTO study_groups (name, course_id, created_by)
      VALUES (?, ?, ?)
    `;
    
    const result = await query(createSql, [name, courseId, userId]);
    const groupId = result.insertId;
    
    // Add creator as a member
    const joinSql = `
      INSERT INTO group_members (group_id, user_id)
      VALUES (?, ?)
    `;
    
    await query(joinSql, [groupId, userId]);
    
    return { id: groupId, name };
  } catch (error) {
    console.error('Error creating study group:', error);
    throw error;
  }
}

export async function joinStudyGroup(groupId, userId) {
  try {
    const sql = `
      INSERT INTO group_members (group_id, user_id)
      VALUES (?, ?)
    `;
    
    await query(sql, [groupId, userId]);
    return { success: true };
  } catch (error) {
    console.error('Error joining study group:', error);
    throw error;
  }
}

export async function leaveStudyGroup(groupId, userId) {
  try {
    const sql = `
      DELETE FROM group_members
      WHERE group_id = ? AND user_id = ?
    `;
    
    await query(sql, [groupId, userId]);
    return { success: true };
  } catch (error) {
    console.error('Error leaving study group:', error);
    throw error;
  }
}