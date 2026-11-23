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
    role          TEXT NOT NULL CHECK (role IN ('employee', 'manager')),
    is_admin      INTEGER NOT NULL DEFAULT 0,
    title         TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
