const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;

/* Database */
const db = new Database(path.join(__dirname, "railpulse.db"));

app.use(express.json());

/* ======================= */
/* API ROUTES FIRST */
/* ======================= */

app.get("/api/test", (req, res) => {
  res.json({ status: "RailPulse API working 🚀" });
});

app.get("/api/stations", (req, res) => {
  const search = req.query.search;
  if (!search) return res.json([]);

  const stmt = db.prepare(`
    SELECT code, name, state
    FROM stations
    WHERE name LIKE ? OR code LIKE ?
    LIMIT 10
  `);

  const results = stmt.all(`%${search}%`, `%${search}%`);
  res.json(results);
});

/* ======================= */
/* STATIC FILES LAST */
/* ======================= */

app.use(express.static(path.join(__dirname, "public")));

/* Fallback */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log("RailPulse running on port " + PORT);
});
