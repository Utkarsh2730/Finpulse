const sqlite = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dataFolder = path.join(__dirname, '..', '..', 'data');
fs.mkdirSync(dataFolder, { recursive: true });

const db = new sqlite.DatabaseSync(path.join(dataFolder, 'finpulse.db'));

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS companies (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    team_size  TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id    INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL CHECK (role IN ('employee', 'manager', 'finance')),
    is_admin      INTEGER NOT NULL DEFAULT 0,
    title         TEXT,
    manager_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS claims (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    category     TEXT NOT NULL,
    expense_date TEXT NOT NULL,
    amount       REAL NOT NULL,
    currency     TEXT NOT NULL DEFAULT 'INR',
    reason       TEXT NOT NULL,
    receipt_name TEXT,
    receipt_data TEXT,
    status       TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'manager_approved', 'approved', 'rejected')),
    review_note  TEXT,
    finance_note TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const userColumns = db.prepare('PRAGMA table_info(users)').all();
let hasManagerColumn = false;
for (let i = 0; i < userColumns.length; i++) {
  if (userColumns[i].name === 'manager_id') {
    hasManagerColumn = true;
  }
}
if (!hasManagerColumn) {
  db.exec('ALTER TABLE users ADD COLUMN manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL');
}

module.exports = db;
