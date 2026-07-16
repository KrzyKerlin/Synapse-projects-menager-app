const express = require("express");
const requireAuth = require("../middleware/auth");
const {
  listFolders,
  createFolder,
  updateFolder,
  deleteFolder,
} = require("../controllers/folders.controller");

const router = express.Router();

router.use(requireAuth);

router.get("/", listFolders);
router.post("/", createFolder);
router.put("/:id", updateFolder);
router.delete("/:id", deleteFolder);

module.exports = router;
