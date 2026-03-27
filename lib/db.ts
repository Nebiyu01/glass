import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

let db: Database.Database | null = null;

function getDbPath(): string {
  if (process.env.GLASS_DB_PATH) return process.env.GLASS_DB_PATH;
  return path.join(os.homedir(), 'Library', 'Application Support', 'glass', 'pickleglass.db');
}

export function getDb(): Database.Database {
  if (db) return db;
  const dbPath = getDbPath();
  db = new Database(dbPath, { readonly: true });
  return db;
}
