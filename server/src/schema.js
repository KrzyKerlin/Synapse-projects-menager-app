const db = require("./db");

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      pos_x REAL DEFAULT 40,
      pos_y REAL DEFAULT 40,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      folder_id TEXT REFERENCES folders(id),
      name TEXT NOT NULL,
      domain TEXT DEFAULT '',
      description TEXT DEFAULT '',
      type TEXT DEFAULT 'website',
      emoji TEXT DEFAULT '🚀',
      logo TEXT,
      colors TEXT DEFAULT '[]',
      fonts TEXT DEFAULT '[]',
      techs TEXT DEFAULT '[]',
      notes TEXT DEFAULT '',
      repo TEXT DEFAULT '',
      pos_x REAL DEFAULT 60,
      pos_y REAL DEFAULT 60,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      project_id TEXT REFERENCES projects(id),
      title TEXT NOT NULL,
      type TEXT DEFAULT 'feat',
      priority TEXT DEFAULT 'medium',
      description TEXT DEFAULT '',
      due TEXT,
      done INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      done_at TEXT
    );

    CREATE TABLE IF NOT EXISTS commits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      project_id TEXT REFERENCES projects(id),
      hash TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'feat',
      description TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

module.exports = initSchema;
