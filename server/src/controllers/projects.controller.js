const db = require("../db");
const { randomUUID } = require("crypto");
const { serializeProject } = require("../utils/serialize");

function listProjects(req, res) {
  const rows = db
    .prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at ASC")
    .all(req.user.id);
  res.json(rows.map(serializeProject));
}

function createProject(req, res) {
  const body = req.body;

  if (!body.name || !body.name.trim()) {
    return res.status(400).json({ error: "Nazwa projektu jest wymagana." });
  }

  const project = {
    id: randomUUID(),
    user_id: req.user.id,
    folder_id: body.folderId || null,
    name: body.name.trim(),
    domain: body.domain || "",
    description: body.desc || "",
    type: body.type || "website",
    emoji: body.emoji || "🚀",
    logo: body.logo || null,
    colors: JSON.stringify(body.colors || []),
    fonts: JSON.stringify(body.fonts || []),
    techs: JSON.stringify(body.techs || []),
    notes: body.notes || "",
    repo: body.repo || "",
    pos_x: body.x ?? 60,
    pos_y: body.y ?? 60,
    created_at: new Date().toISOString(),
    updated_at: null,
  };

  db.prepare(
    `INSERT INTO projects
      (id, user_id, folder_id, name, domain, description, type, emoji, logo, colors, fonts, techs, notes, repo, pos_x, pos_y, created_at, updated_at)
     VALUES
      (@id, @user_id, @folder_id, @name, @domain, @description, @type, @emoji, @logo, @colors, @fonts, @techs, @notes, @repo, @pos_x, @pos_y, @created_at, @updated_at)`,
  ).run(project);

  res.status(201).json(serializeProject(project));
}

function getProject(req, res) {
  const row = db
    .prepare("SELECT * FROM projects WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!row) {
    return res.status(404).json({ error: "Projekt nie istnieje." });
  }

  res.json(serializeProject(row));
}

function updateProject(req, res) {
  const existing = db
    .prepare("SELECT * FROM projects WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!existing) {
    return res.status(404).json({ error: "Projekt nie istnieje." });
  }

  const body = req.body;
  const updated = {
    ...existing,
    folder_id: body.folderId !== undefined ? body.folderId : existing.folder_id,
    name: body.name !== undefined ? body.name : existing.name,
    domain: body.domain !== undefined ? body.domain : existing.domain,
    description: body.desc !== undefined ? body.desc : existing.description,
    type: body.type !== undefined ? body.type : existing.type,
    emoji: body.emoji !== undefined ? body.emoji : existing.emoji,
    logo: body.logo !== undefined ? body.logo : existing.logo,
    colors: body.colors !== undefined ? JSON.stringify(body.colors) : existing.colors,
    fonts: body.fonts !== undefined ? JSON.stringify(body.fonts) : existing.fonts,
    techs: body.techs !== undefined ? JSON.stringify(body.techs) : existing.techs,
    notes: body.notes !== undefined ? body.notes : existing.notes,
    repo: body.repo !== undefined ? body.repo : existing.repo,
    pos_x: body.x !== undefined ? body.x : existing.pos_x,
    pos_y: body.y !== undefined ? body.y : existing.pos_y,
    updated_at: new Date().toISOString(),
  };

  db.prepare(
    `UPDATE projects SET
      folder_id = @folder_id, name = @name, domain = @domain, description = @description,
      type = @type, emoji = @emoji, logo = @logo, colors = @colors, fonts = @fonts,
      techs = @techs, notes = @notes, repo = @repo, pos_x = @pos_x, pos_y = @pos_y,
      updated_at = @updated_at
     WHERE id = @id AND user_id = @user_id`,
  ).run(updated);

  res.json(serializeProject(updated));
}

function deleteProject(req, res) {
  const existing = db
    .prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!existing) {
    return res.status(404).json({ error: "Projekt nie istnieje." });
  }

  // Cascade: a project's tasks and commits don't make sense without it.
  db.prepare("DELETE FROM tasks WHERE project_id = ? AND user_id = ?").run(
    req.params.id,
    req.user.id,
  );
  db.prepare("DELETE FROM commits WHERE project_id = ? AND user_id = ?").run(
    req.params.id,
    req.user.id,
  );
  db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").run(
    req.params.id,
    req.user.id,
  );

  res.status(204).end();
}

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
};
