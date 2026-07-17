const express = require("express");
const requireAuth = require("../middleware/auth");
const { listCommits, createCommit } = require("../controllers/commits.controller");

const router = express.Router();

router.use(requireAuth);

router.get("/", listCommits);
router.post("/", createCommit);

module.exports = router;
