import * as SQLite from 'expo-sqlite';
import {
  DB_NAME,
  DB_VERSION,
  MIGRATIONS,
  MIGRATIONS_V2,
  MIGRATIONS_V3,
  MIGRATIONS_V4,
  MIGRATIONS_V5,
  MIGRATIONS_V6,
  MIGRATIONS_V7,
} from './schema';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function ensureMetaTable(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(
    `CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );`
  );
}

async function getCurrentDbVersion(database: SQLite.SQLiteDatabase): Promise<number> {
  await ensureMetaTable(database);
  const row = await database.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_meta WHERE key = 'db_version'`
  );
  return row ? Number(row.value) : 0;
}

async function setDbVersion(database: SQLite.SQLiteDatabase, version: number): Promise<void> {
  await ensureMetaTable(database);
  await database.runAsync(
    `INSERT INTO app_meta (key, value) VALUES ('db_version', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    String(version)
  );
}

async function execStatements(database: SQLite.SQLiteDatabase, statements: string[]): Promise<void> {
  for (const sql of statements) {
    try {
      await database.execAsync(sql);
    } catch (err: any) {
      if (String(err).includes('duplicate column name') || String(err).includes('duplicate column')) {
        console.warn(`[db] Ignoring duplicate column error:`, String(err));
      } else {
        throw err;
      }
    }
  }
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  let currentVersion = await getCurrentDbVersion(database);

  if (currentVersion === 0) {
    await database.execAsync('BEGIN');
    try {
      await execStatements(database, MIGRATIONS);
      await setDbVersion(database, 1);
      await database.execAsync('COMMIT');
      currentVersion = 1;
    } catch (error) {
      await database.execAsync('ROLLBACK');
      throw error;
    }
  }

  if (currentVersion < 2) {
    await database.execAsync('BEGIN');
    try {
      await execStatements(database, MIGRATIONS_V2);
      await setDbVersion(database, 2);
      await database.execAsync('COMMIT');
      currentVersion = 2;
    } catch (error) {
      await database.execAsync('ROLLBACK');
      throw error;
    }
  }

  if (currentVersion < 3) {
    await database.execAsync('BEGIN');
    try {
      await execStatements(database, MIGRATIONS_V3);
      await setDbVersion(database, 3);
      await database.execAsync('COMMIT');
      currentVersion = 3;
    } catch (error) {
      await database.execAsync('ROLLBACK');
      throw error;
    }
  }

  if (currentVersion < 4) {
    await database.execAsync('BEGIN');
    try {
      await execStatements(database, MIGRATIONS_V4);
      await setDbVersion(database, 4);
      await database.execAsync('COMMIT');
      currentVersion = 4;
    } catch (error) {
      await database.execAsync('ROLLBACK');
      throw error;
    }
  }

  if (currentVersion < 5) {
    await database.execAsync('BEGIN');
    try {
      await execStatements(database, MIGRATIONS_V5);
      await setDbVersion(database, 5);
      await database.execAsync('COMMIT');
      currentVersion = 5;
    } catch (error) {
      await database.execAsync('ROLLBACK');
      throw error;
    }
  }

  if (currentVersion < 6) {
    await database.execAsync('BEGIN');
    try {
      await execStatements(database, MIGRATIONS_V6);
      await setDbVersion(database, 6);
      await database.execAsync('COMMIT');
      currentVersion = 6;
    } catch (error) {
      await database.execAsync('ROLLBACK');
      throw error;
    }
  }

  if (currentVersion < DB_VERSION) {
    await database.execAsync('BEGIN');
    try {
      await execStatements(database, MIGRATIONS_V7);
      await setDbVersion(database, DB_VERSION);
      await database.execAsync('COMMIT');
    } catch (error) {
      await database.execAsync('ROLLBACK');
      throw error;
    }
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  if (!initPromise) {
    initPromise = (async () => {
      const database = await SQLite.openDatabaseAsync(DB_NAME);
      await runMigrations(database);
      db = database;
      return database;
    })();
  }
  return initPromise;
}

export async function initDatabase(): Promise<void> {
  await getDatabase();
}
