const db = require("../db");
const { randomUUID } = require("crypto");
const { serializeFolder } = require("../utils/serialize");

function listFolders(req, res) {
  const rows = db
    .prepare("SELECT * FROM folders WHERE user_id = ? ORDER BY created_at ASC")
    .all(req.user.id);
  res.json(rows.map(serializeFolder));
}

function createFolder(req, res) {
  const body = req.body;

  if (!body.name || !body.name.trim()) {
    return res.status(400).json({ error: "Nazwa katalogu jest wymagana." });
  }

  const folder = {
    id: randomUUID(),
    user_id: req.user.id,
    name: body.name.trim(),
    description: body.desc || "",
    pos_x: body.x ?? 40,
    pos_y: body.y ?? 40,
    created_at: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO folders (id, user_id, name, description, pos_x, pos_y, created_at)
     VALUES (@id, @user_id, @name, @description, @pos_x, @pos_y, @created_at)`,
  ).run(folder);

  res.status(201).json(serializeFolder(folder));
}

function updateFolder(req, res) {
  const existing = db
    .prepare("SELECT * FROM folders WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!existing) {
    return res.status(404).json({ error: "Katalog nie istnieje." });
  }

  const body = req.body;
  const updated = {
    ...existing,
    name: body.name !== undefined ? body.name : existing.name,
    description: body.desc !== undefined ? body.desc : existing.description,
    pos_x: body.x !== undefined ? body.x : existing.pos_x,
    pos_y: body.y !== undefined ? body.y : existing.pos_y,
  };

  db.prepare(
    `UPDATE folders SET name = @name, description = @description, pos_x = @pos_x, pos_y = @pos_y
     WHERE id = @id AND user_id = @user_id`,
  ).run(updated);

  res.json(serializeFolder(updated));
}

function deleteFolder(req, res) {
  const existing = db
    .prepare("SELECT id FROM folders WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!existing) {
    return res.status(404).json({ error: "Katalog nie istnieje." });
  }

  // Projects in this folder stay — they just lose their folder grouping.
  db.prepare("UPDATE projects SET folder_id = NULL WHERE folder_id = ? AND user_id = ?").run(
    req.params.id,
    req.user.id,
  );
  db.prepare("DELETE FROM folders WHERE id = ? AND user_id = ?").run(
    req.params.id,
    req.user.id,
  );

  res.status(204).end();
}

module.exports = { listFolders, createFolder, updateFolder, deleteFolder };
