require("dotenv").config();

const express = require("express");
const cors = require("cors");
const initSchema = require("./schema");
const authRoutes = require("./routes/auth.routes");
const projectsRoutes = require("./routes/projects.routes");
const foldersRoutes = require("./routes/folders.routes");
const tasksRoutes = require("./routes/tasks.routes");
const commitsRoutes = require("./routes/commits.routes");
const chatRoutes = require("./routes/chat.routes");

initSchema();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/folders", foldersRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/commits", commitsRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Synapse API listening on http://localhost:${PORT}`);
});
