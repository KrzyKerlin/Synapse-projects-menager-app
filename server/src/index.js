require("dotenv").config();

const express = require("express");
const cors = require("cors");
const initSchema = require("./schema");
const authRoutes = require("./routes/auth.routes");

initSchema();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Synapse API listening on http://localhost:${PORT}`);
});
