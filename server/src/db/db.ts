import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'tutor_robot.sqlite');

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  await dbInstance.exec('PRAGMA foreign_keys = ON');
  
  return dbInstance;
}
