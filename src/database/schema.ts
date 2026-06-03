/**
 * AuthEdge — Database Schema
 *
 * DDL statements for initializing SQLite database tables.
 */

export const SCHEMA_SQL = [
  // User profile & credentials table
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT,
    employee_id TEXT,
    pin_hash TEXT NOT NULL,
    face_enrolled INTEGER DEFAULT 0,
    face_angles_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );`,

  // Index on users email and employee_id for quick lookups
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_employee ON users (employee_id);`,

  // Attendance records table (one record per user per day)
  `CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,              -- YYYY-MM-DD
    check_in_time TEXT,              -- HH:MM:SS
    check_out_time TEXT,             -- HH:MM:SS
    status TEXT NOT NULL DEFAULT 'pending',  -- 'present', 'absent', 'pending', 'late'
    verification_method TEXT DEFAULT 'face', -- 'face', 'pin', 'manual'
    confidence_score REAL,
    location TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );`,

  // Settings table (key-value)
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );`,

  // Sync queue for AWS integration
  `CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    action TEXT NOT NULL,            -- 'insert', 'update', 'delete'
    payload TEXT,                    -- JSON stringified data
    status TEXT DEFAULT 'pending',   -- 'pending', 'syncing', 'synced', 'failed'
    attempts INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    synced_at TEXT
  );`,

  // Sessions table for login state persistence
  `CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,     -- 1 = active, 0 = inactive
    login_at TEXT DEFAULT (datetime('now')),
    logout_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );`
];
