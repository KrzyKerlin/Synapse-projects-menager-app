const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

function hashPassword(plainPassword) {
  return bcrypt.hashSync(plainPassword, SALT_ROUNDS);
}

function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compareSync(plainPassword, passwordHash);
}

module.exports = { hashPassword, verifyPassword };
