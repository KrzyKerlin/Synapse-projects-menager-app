const express = require("express");
const requireAuth = require("../middleware/auth");
const { listMessages, sendMessage } = require("../controllers/chat.controller");

const router = express.Router();

router.use(requireAuth);

router.get("/messages", listMessages);
router.post("/messages", sendMessage);

module.exports = router;
