const db = require("../db");
const { randomUUID } = require("crypto");
const { serializeCommit } = require("../utils/serialize");

function shortHash() {
  return randomUUID().replace(/-/g, "").slice(0, 7);
}

function listCommits(req, res) {
  const rows = db
    .prepare("SELECT * FROM commits WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id);
  res.json(rows.map(serializeCommit));
}

function createCommit(req, res) {
  const body = req.body;

  if (!body.message || !body.message.trim()) {
    return res.status(400).json({ error: "Wiadomość commita jest wymagana." });
  }

  const commit = {
    id: randomUUID(),
    user_id: req.user.id,
    project_id: body.projectId || null,
    hash: shortHash(),
    message: body.message.trim(),
    type: body.type || "feat",
    description: body.desc || "",
    created_at: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO commits (id, user_id, project_id, hash, message, type, description, created_at)
     VALUES (@id, @user_id, @project_id, @hash, @message, @type, @description, @created_at)`,
  ).run(commit);

  res.status(201).json(serializeCommit(commit));
}

module.exports = { listCommits, createCommit };
