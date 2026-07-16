function parseJsonArray(text) {
  try {
    const value = JSON.parse(text || "[]");
    return Array.isArray(value) ? value : [];
  } catch (err) {
    return [];
  }
}

function serializeProject(row) {
  return {
    id: row.id,
    folderId: row.folder_id,
    name: row.name,
    domain: row.domain,
    desc: row.description,
    type: row.type,
    emoji: row.emoji,
    logo: row.logo,
    colors: parseJsonArray(row.colors),
    fonts: parseJsonArray(row.fonts),
    techs: parseJsonArray(row.techs),
    notes: row.notes,
    repo: row.repo,
    x: row.pos_x,
    y: row.pos_y,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function serializeFolder(row) {
  return {
    id: row.id,
    name: row.name,
    desc: row.description,
    x: row.pos_x,
    y: row.pos_y,
    createdAt: row.created_at,
  };
}

function serializeTask(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    type: row.type,
    priority: row.priority,
    desc: row.description,
    due: row.due,
    done: !!row.done,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    doneAt: row.done_at,
  };
}

function serializeCommit(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    hash: row.hash,
    message: row.message,
    type: row.type,
    desc: row.description,
    createdAt: row.created_at,
  };
}

module.exports = {
  parseJsonArray,
  serializeProject,
  serializeFolder,
  serializeTask,
  serializeCommit,
};
