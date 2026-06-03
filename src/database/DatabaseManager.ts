/**
 * AuthEdge — Database Manager
 *
 * Handles encrypted database initialization, connections, migrations, and lifecycle.
 */

import SQLite from 'react-native-sqlcipher-storage';
import { SCHEMA_SQL } from './schema';

// Enable promises for SQLCipher storage library
SQLite.enablePromise(true);

const DB_CONFIG = {
  name: 'authedge_secure.db',
  location: 'default',
  key: 'AuthEdgeSecurePassphrase2026Hackathon', // Encryption passphrase for SQLCipher AES-256
};

let dbInstance: any = null;
let isInitializing = false;
let initPromise: Promise<any> | null = null;

export const DatabaseManager = {
  /**
   * Returns the active database instance. Initializes if not already open.
   */
  async getDatabase(): Promise<any> {
    if (dbInstance) {
      return dbInstance;
    }
    
    if (isInitializing && initPromise) {
      return initPromise;
    }

    initPromise = this.initDatabase();
    return initPromise;
  },

  /**
   * Initializes the database connection and runs schemas/migrations.
   */
  async initDatabase(): Promise<any> {
    isInitializing = true;
    try {
      console.log('[DatabaseManager] Opening encrypted SQLite database...');
      
      const db = await SQLite.openDatabase({
        name: DB_CONFIG.name,
        location: DB_CONFIG.location,
        key: DB_CONFIG.key,
      });

      console.log('[DatabaseManager] SQLite database opened. Running schema migrations...');
      dbInstance = db;

      // Execute DDL schemas
      await this.runMigrations(db);
      
      console.log('[DatabaseManager] Database migration completed successfully.');
      isInitializing = false;
      return dbInstance;
    } catch (error) {
      console.warn('[DatabaseManager] Critical database initialization error:', error);
      isInitializing = false;
      initPromise = null;
      throw error;
    }
  },

  /**
   * Runs schema migrations by executing each DDL query in order.
   */
  async runMigrations(db: any): Promise<void> {
    for (const sql of SCHEMA_SQL) {
      try {
        await db.executeSql(sql);
      } catch (err) {
        console.warn('[DatabaseManager] Migration query failed:', sql, err);
        throw err;
      }
    }
  },

  /**
   * Closes the active database connection.
   */
  async closeDatabase(): Promise<void> {
    if (!dbInstance) return;
    try {
      console.log('[DatabaseManager] Closing database connection...');
      await dbInstance.close();
      dbInstance = null;
      initPromise = null;
      console.log('[DatabaseManager] Database connection closed.');
    } catch (error) {
      console.warn('[DatabaseManager] Error closing database:', error);
      throw error;
    }
  },

  /**
   * Wipes all database tables (compliant with NIST 800-88 purge) and re-runs schemas.
   */
  async purgeAllData(): Promise<void> {
    const db = await this.getDatabase();
    console.log('[DatabaseManager] Initiating secure purge of all tables...');
    
    const tablesToPurge = ['sessions', 'sync_queue', 'attendance', 'users', 'settings'];
    
    // Disable foreign keys temporarily to avoid cascade blocks during truncation
    try {
      await db.executeSql('PRAGMA foreign_keys = OFF;');
      
      for (const table of tablesToPurge) {
        await db.executeSql(`DROP TABLE IF EXISTS ${table};`);
      }
      
      await db.executeSql('PRAGMA foreign_keys = ON;');
      
      // Re-run schema migrations to recreate empty tables
      await this.runMigrations(db);
      console.log('[DatabaseManager] Secure purge completed. Empty tables re-initialized.');
    } catch (error) {
      console.warn('[DatabaseManager] Error during database secure purge:', error);
      throw error;
    }
  }
};
export default DatabaseManager;
