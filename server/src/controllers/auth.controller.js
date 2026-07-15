const db = require("../db");
const { randomUUID } = require("crypto");
const { hashPassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");

function register(req, res) {
  const { username, password } = req.body;

  if (!username || username.trim().length < 3) {
    return res
      .status(400)
      .json({ error: "Nazwa użytkownika musi mieć min. 3 znaki." });
  }
  if (!password || password.length < 4) {
    return res.status(400).json({ error: "Hasło musi mieć min. 4 znaki." });
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(username.trim());
  if (existing) {
    return res.status(409).json({ error: "Ta nazwa użytkownika jest już zajęta." });
  }

  const user = {
    id: randomUUID(),
    username: username.trim(),
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
  };

  db.prepare(
    "INSERT INTO users (id, username, password_hash, created_at) VALUES (@id, @username, @password_hash, @created_at)",
  ).run(user);

  const token = signToken(user);
  res.status(201).json({ token, user: { id: user.id, username: user.username } });
}

module.exports = { register };
