const db = require("../db");
const { randomUUID } = require("crypto");
const { serializeProject, serializeTask, serializeFolder, serializeCommit } = require("../utils/serialize");
const { answerQuery, findMentionedProject, parseTaskCommand, inferContextProject } = require("../services/aiEngine");
const { insertTask } = require("./tasks.controller");

const HISTORY_LIMIT = 12;

function saveMessage(userId, role, text) {
  const message = {
    id: randomUUID(),
    user_id: userId,
    role,
    text,
    created_at: new Date().toISOString(),
  };
  db.prepare(
    "INSERT INTO chat_messages (id, user_id, role, text, created_at) VALUES (@id, @user_id, @role, @text, @created_at)",
  ).run(message);
  return message;
}

function serializeMessage(row) {
  return { id: row.id, role: row.role, text: row.text, createdAt: row.created_at };
}

function listMessages(req, res) {
  const rows = db
    .prepare("SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC")
    .all(req.user.id);
  res.json(rows.map(serializeMessage));
}

function loadUserData(userId) {
  const projects = db
    .prepare("SELECT * FROM projects WHERE user_id = ?")
    .all(userId)
    .map(serializeProject);
  const tasks = db
    .prepare("SELECT * FROM tasks WHERE user_id = ?")
    .all(userId)
    .map(serializeTask);
  const folders = db
    .prepare("SELECT * FROM folders WHERE user_id = ?")
    .all(userId)
    .map(serializeFolder);
  const commits = db
    .prepare("SELECT * FROM commits WHERE user_id = ?")
    .all(userId)
    .map(serializeCommit);
  return { projects, tasks, folders, commits };
}

function sendMessage(req, res) {
  const text = (req.body.text || "").trim();
  if (!text) {
    return res.status(400).json({ error: "Wiadomość nie może być pusta." });
  }

  saveMessage(req.user.id, "user", text);
  const data = loadUserData(req.user.id);

  // Task-creation command takes priority over question-answering.
  const command = parseTaskCommand(text, data.projects);
  if (command) {
    const task = insertTask(req.user.id, command);
    const project = task.projectId
      ? data.projects.find((p) => p.id === task.projectId)
      : null;
    const reply =
      `Dodałem zadanie „${task.title}”` +
      (project ? ` do projektu ${project.name}` : "") +
      (task.due ? `, termin: ${task.due}` : "") +
      `.`;
    saveMessage(req.user.id, "ai", reply);
    return res.json({ reply, task });
  }

  const recentMessages = db
    .prepare("SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?")
    .all(req.user.id, HISTORY_LIMIT)
    .map(serializeMessage);

  const explicitProject = findMentionedProject(text, data.projects);
  const pinnedProject = req.body.contextProjectId
    ? data.projects.find((p) => p.id === req.body.contextProjectId)
    : null;
  const matchProject =
    explicitProject || pinnedProject || inferContextProject(recentMessages.slice(1), data.projects);

  const reply = answerQuery(text, data, matchProject);
  saveMessage(req.user.id, "ai", reply);
  res.json({ reply });
}

module.exports = { listMessages, sendMessage };
