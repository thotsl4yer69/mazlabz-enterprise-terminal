import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export async function connect() {
  if (db) return db;

  const dbPath = path.join(__dirname, '..', 'data');
  await import('fs/promises').then(fs => fs.mkdir(dbPath, { recursive: true }));

  db = await open({
    filename: path.join(dbPath, 'mazlabz.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS command_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      command TEXT,
      timestamp DATETIME,
      FOREIGN KEY (session_id) REFERENCES sessions (id)
    );

    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      filename TEXT,
      gcs_path TEXT,
      mimetype TEXT,
      size INTEGER,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions (id)
    );

    CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        name TEXT,
        email TEXT,
        company TEXT,
        project_type TEXT,
        budget TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions (id)
    );

    CREATE TABLE IF NOT EXISTS pigeon_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        recipient TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions (id)
    );
  `);

  return db;
}

// --- Write Operations ---

export async function addSession(sessionId) {
  const db = await connect();
  await db.run('INSERT OR IGNORE INTO sessions (id) VALUES (?)', sessionId);
}

export async function logCommand(sessionId, command) {
  const db = await connect();
  await db.run('INSERT INTO command_log (session_id, command, timestamp) VALUES (?, ?, ?)', sessionId, command, new Date().toISOString());
}

export async function storeFileMetadata({ id, sessionId, filename, gcsPath, mimetype, size }) {
    const db = await connect();
    await db.run(
        'INSERT INTO files (id, session_id, filename, gcs_path, mimetype, size) VALUES (?, ?, ?, ?, ?, ?)',
        id, sessionId, filename, gcsPath, mimetype, size
    );
}

export async function addLead({ sessionId, name, email, company, projectType, budget }) {
    const db = await connect();
    await db.run(
        'INSERT INTO leads (session_id, name, email, company, project_type, budget) VALUES (?, ?, ?, ?, ?, ?)',
        sessionId, name, email, company, projectType, budget
    );
}

export async function addPigeonMessage({ sessionId, recipient, message }) {
  const db = await connect();
  await db.run(
    'INSERT INTO pigeon_messages (session_id, recipient, message) VALUES (?, ?, ?)',
    sessionId,
    recipient,
    message
  );
}


// --- Read Operations ---

export async function getFiles() {
    const db = await connect();
    return db.all('SELECT id, filename, size, upload_date FROM files ORDER BY upload_date DESC');
}

export async function getFileById(id) {
    const db = await connect();
    return db.get('SELECT * FROM files WHERE id = ?', id);
}

export async function getDashboardSummary() {
    const db = await connect();
    const total_files = await db.get('SELECT COUNT(*) as count FROM files');
    const total_size = await db.get('SELECT SUM(size) as sum FROM files');
    const recent_files = await db.all('SELECT filename, size FROM files ORDER BY upload_date DESC LIMIT 5');
    return {
        total_files: total_files.count,
        total_size: total_size.sum || 0,
        files: recent_files,
    };
}

export async function getAllLeads() {
    const db = await connect();
    return db.all('SELECT * FROM leads ORDER BY created_at DESC');
}

export async function getCommandLogs() {
    const db = await connect();
    return db.all('SELECT * FROM command_log ORDER BY timestamp DESC');
}

export async function getAllSessions() {
    const db = await connect();
    return db.all('SELECT * FROM sessions ORDER BY created_at DESC');
}


// --- Delete Operations ---

export async function deleteFile(id) {
    const db = await connect();
    await db.run('DELETE FROM files WHERE id = ?', id);
}
