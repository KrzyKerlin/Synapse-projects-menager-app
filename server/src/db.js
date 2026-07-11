const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "synapse.sqlite");
const db = new Database(dbPath);

// Faster + safer for a single-file app under concurrent requests.
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

module.exports = db;
