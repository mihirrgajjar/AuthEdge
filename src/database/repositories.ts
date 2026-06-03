/**
 * AuthEdge — Database Repositories
 *
 * Provides data access objects (DAO) for Users, Attendance, Settings, Sync Queue, and Sessions.
 */

import DatabaseManager from './DatabaseManager';

/**
 * Execute a SQL query and return results.
 */
async function executeQuery(query: string, params: any[] = []): Promise<any> {
  console.log(`[Database Repository] Executing query: ${query.trim().replace(/\s+/g, ' ')} with params:`, params);
  const db = await DatabaseManager.getDatabase();
  try {
    const [results] = await db.executeSql(query, params);
    console.log(`[Database Repository] Query completed: ${query.trim().replace(/\s+/g, ' ')}`);
    return results;
  } catch (error) {
    console.warn(`[Database Repository] Query failed: ${query}`, params, error);
    throw error;
  }
}

// ─── USER REPOSITORY ──────────────────────────────────────────────────────────

export const UserRepository = {
  async create(user: {
    fullName: string;
    email: string;
    employeeId: string;
    pinHash: string;
    faceEnrolled: number;
    faceAnglesCount: number;
  }): Promise<number> {
    const query = `
      INSERT INTO users (full_name, email, employee_id, pin_hash, face_enrolled, face_angles_count)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    const result = await executeQuery(query, [
      user.fullName,
      user.email,
      user.employeeId,
      user.pinHash,
      user.faceEnrolled,
      user.faceAnglesCount,
    ]);
    return result.insertId;
  },

  async findById(id: number): Promise<any | null> {
    const query = 'SELECT * FROM users WHERE id = ? LIMIT 1;';
    const result = await executeQuery(query, [id]);
    if (result.rows.length > 0) {
      return result.rows.item(0);
    }
    return null;
  },

  async findByEmployeeId(employeeId: string): Promise<any | null> {
    const query = 'SELECT * FROM users WHERE employee_id = ? LIMIT 1;';
    const result = await executeQuery(query, [employeeId]);
    if (result.rows.length > 0) {
      return result.rows.item(0);
    }
    return null;
  },

  async count(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM users;';
    const result = await executeQuery(query);
    return result.rows.item(0).count;
  },

  async update(id: number, updates: {
    fullName?: string;
    email?: string;
    employeeId?: string;
    pinHash?: string;
    faceEnrolled?: number;
    faceAnglesCount?: number;
  }): Promise<void> {
    const fields: string[] = [];
    const params: any[] = [];

    if (updates.fullName !== undefined) {
      fields.push('full_name = ?');
      params.push(updates.fullName);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      params.push(updates.email);
    }
    if (updates.employeeId !== undefined) {
      fields.push('employee_id = ?');
      params.push(updates.employeeId);
    }
    if (updates.pinHash !== undefined) {
      fields.push('pin_hash = ?');
      params.push(updates.pinHash);
    }
    if (updates.faceEnrolled !== undefined) {
      fields.push('face_enrolled = ?');
      params.push(updates.faceEnrolled);
    }
    if (updates.faceAnglesCount !== undefined) {
      fields.push('face_angles_count = ?');
      params.push(updates.faceAnglesCount);
    }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    params.push(id); // for WHERE clause

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?;`;
    await executeQuery(query, params);
  },

  async getFirstUser(): Promise<any | null> {
    const query = 'SELECT * FROM users LIMIT 1;';
    const result = await executeQuery(query);
    if (result.rows.length > 0) {
      return result.rows.item(0);
    }
    return null;
  }
};

// ─── ATTENDANCE REPOSITORY ────────────────────────────────────────────────────

export const AttendanceRepository = {
  async markAttendance(record: {
    userId: number;
    date: string; // YYYY-MM-DD
    checkInTime: string; // HH:MM:SS
    status: string; // 'present', 'absent', 'pending', 'late'
    verificationMethod: string; // 'face', 'pin', 'manual'
    confidenceScore: number;
    location: string;
  }): Promise<number> {
    // Insert new check-in or update existing (upsert)
    const query = `
      INSERT OR REPLACE INTO attendance (user_id, date, check_in_time, status, verification_method, confidence_score, location)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const result = await executeQuery(query, [
      record.userId,
      record.date,
      record.checkInTime,
      record.status,
      record.verificationMethod,
      record.confidenceScore,
      record.location,
    ]);
    return result.insertId;
  },

  async markCheckOut(userId: number, date: string, checkOutTime: string): Promise<void> {
    const query = `
      UPDATE attendance 
      SET check_out_time = ? 
      WHERE user_id = ? AND date = ?;
    `;
    await executeQuery(query, [checkOutTime, userId, date]);
  },

  async getTodayRecord(userId: number, date: string): Promise<any | null> {
    const query = 'SELECT * FROM attendance WHERE user_id = ? AND date = ? LIMIT 1;';
    const result = await executeQuery(query, [userId, date]);
    if (result.rows.length > 0) {
      return result.rows.item(0);
    }
    return null;
  },

  async getRecentRecords(userId: number, limit: number): Promise<any[]> {
    const query = `
      SELECT * FROM attendance 
      WHERE user_id = ? 
      ORDER BY date DESC, check_in_time DESC 
      LIMIT ?;
    `;
    const result = await executeQuery(query, [userId, limit]);
    const list: any[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      list.push(result.rows.item(i));
    }
    return list;
  },

  async getRecordsByMonth(userId: number, yearMonth: string): Promise<any[]> {
    // yearMonth like '2026-06'
    const query = `
      SELECT * FROM attendance 
      WHERE user_id = ? AND date LIKE ? 
      ORDER BY date ASC;
    `;
    const result = await executeQuery(query, [userId, `${yearMonth}%`]);
    const list: any[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      list.push(result.rows.item(i));
    }
    return list;
  },

  async getMonthlyStats(userId: number, yearMonth: string): Promise<{
    present: number;
    absent: number;
    late: number;
    total: number;
  }> {
    const query = `
      SELECT 
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        COUNT(*) as total
      FROM attendance
      WHERE user_id = ? AND date LIKE ?;
    `;
    const result = await executeQuery(query, [userId, `${yearMonth}%`]);
    const item = result.rows.item(0);
    return {
      present: item.present || 0,
      absent: item.absent || 0,
      late: item.late || 0,
      total: item.total || 0,
    };
  }
};

// ─── SETTINGS REPOSITORY ──────────────────────────────────────────────────────

export const SettingsRepository = {
  async get(key: string, defaultValue: string): Promise<string> {
    const query = 'SELECT value FROM settings WHERE key = ? LIMIT 1;';
    const result = await executeQuery(query, [key]);
    if (result.rows.length > 0) {
      return result.rows.item(0).value;
    }
    return defaultValue;
  },

  async set(key: string, value: string): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO settings (key, value)
      VALUES (?, ?);
    `;
    await executeQuery(query, [key, value]);
  },

  async getAll(): Promise<Record<string, string>> {
    const query = 'SELECT * FROM settings;';
    const result = await executeQuery(query);
    const settings: Record<string, string> = {};
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      settings[item.key] = item.value;
    }
    return settings;
  }
};

// ─── SYNC QUEUE REPOSITORY ────────────────────────────────────────────────────

export const SyncQueueRepository = {
  async enqueue(tableName: string, recordId: number, action: string, payload: any): Promise<number> {
    const query = `
      INSERT INTO sync_queue (table_name, record_id, action, payload)
      VALUES (?, ?, ?, ?);
    `;
    const result = await executeQuery(query, [
      tableName,
      recordId,
      action,
      JSON.stringify(payload),
    ]);
    return result.insertId;
  },

  async getPending(): Promise<any[]> {
    const query = "SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC;";
    const result = await executeQuery(query);
    const list: any[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      list.push(result.rows.item(i));
    }
    return list;
  },

  async updateStatus(id: number, status: 'synced' | 'failed', attempts: number): Promise<void> {
    const query = status === 'synced'
      ? "UPDATE sync_queue SET status = ?, attempts = ?, synced_at = datetime('now') WHERE id = ?;"
      : "UPDATE sync_queue SET status = ?, attempts = ? WHERE id = ?;";
    await executeQuery(query, [status, attempts, id]);
  },

  async getStats(): Promise<{
    pending: number;
    synced: number;
    failed: number;
  }> {
    const query = `
      SELECT 
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'synced' THEN 1 ELSE 0 END) as synced,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM sync_queue;
    `;
    const result = await executeQuery(query);
    const item = result.rows.item(0);
    return {
      pending: item.pending || 0,
      synced: item.synced || 0,
      failed: item.failed || 0,
    };
  }
};

// ─── SESSION REPOSITORY ───────────────────────────────────────────────────────

export const SessionRepository = {
  async create(userId: number): Promise<number> {
    // First, deactivate all other sessions
    await executeQuery("UPDATE sessions SET is_active = 0, logout_at = datetime('now') WHERE is_active = 1;");
    
    // Create new session
    const query = 'INSERT INTO sessions (user_id, is_active) VALUES (?, 1);';
    const result = await executeQuery(query, [userId]);
    return result.insertId;
  },

  async getActive(): Promise<any | null> {
    const query = 'SELECT * FROM sessions WHERE is_active = 1 LIMIT 1;';
    const result = await executeQuery(query);
    if (result.rows.length > 0) {
      return result.rows.item(0);
    }
    return null;
  },

  async deactivateAll(): Promise<void> {
    await executeQuery("UPDATE sessions SET is_active = 0, logout_at = datetime('now') WHERE is_active = 1;");
  }
};
