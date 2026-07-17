const db = require("../db");
const { randomUUID } = require("crypto");
const { serializeTask } = require("../utils/serialize");

function listTasks(req, res) {
  const rows = db
    .prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id);
  res.json(rows.map(serializeTask));
}

function createTask(req, res) {
  const body = req.body;

  if (!body.title || !body.title.trim()) {
    return res.status(400).json({ error: "Tytuł zadania jest wymagany." });
  }

  const task = {
    id: randomUUID(),
    user_id: req.user.id,
    project_id: body.projectId || null,
    title: body.title.trim(),
    type: body.type || "feat",
    priority: body.priority || "medium",
    description: body.desc || "",
    due: body.due || null,
    done: 0,
    created_at: new Date().toISOString(),
    updated_at: null,
    done_at: null,
  };

  db.prepare(
    `INSERT INTO tasks
      (id, user_id, project_id, title, type, priority, description, due, done, created_at, updated_at, done_at)
     VALUES
      (@id, @user_id, @project_id, @title, @type, @priority, @description, @due, @done, @created_at, @updated_at, @done_at)`,
  ).run(task);

  res.status(201).json(serializeTask(task));
}

function updateTask(req, res) {
  const existing = db
    .prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!existing) {
    return res.status(404).json({ error: "Zadanie nie istnieje." });
  }

  const body = req.body;
  const doneChanged = body.done !== undefined && !!body.done !== !!existing.done;
  const nowIso = new Date().toISOString();

  const updated = {
    ...existing,
    project_id: body.projectId !== undefined ? body.projectId : existing.project_id,
    title: body.title !== undefined ? body.title : existing.title,
    type: body.type !== undefined ? body.type : existing.type,
    priority: body.priority !== undefined ? body.priority : existing.priority,
    description: body.desc !== undefined ? body.desc : existing.description,
    due: body.due !== undefined ? body.due : existing.due,
    done: body.done !== undefined ? (body.done ? 1 : 0) : existing.done,
    updated_at: nowIso,
    done_at: doneChanged ? (body.done ? nowIso : null) : existing.done_at,
  };

  db.prepare(
    `UPDATE tasks SET
      project_id = @project_id, title = @title, type = @type, priority = @priority,
      description = @description, due = @due, done = @done, updated_at = @updated_at, done_at = @done_at
     WHERE id = @id AND user_id = @user_id`,
  ).run(updated);

  res.json(serializeTask(updated));
}

function deleteTask(req, res) {
  const existing = db
    .prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!existing) {
    return res.status(404).json({ error: "Zadanie nie istnieje." });
  }

  db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").run(
    req.params.id,
    req.user.id,
  );

  res.status(204).end();
}

module.exports = { listTasks, createTask, updateTask, deleteTask };
