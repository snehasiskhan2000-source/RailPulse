const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;

console.log("Opening database...");
const db = new Database(path.join(__dirname, "railpulse.db"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ========================= */
/* ✅ API TEST ROUTE */
/* ========================= */
app.get("/api/test", (req, res) => {
  res.json({ status: "API Working 🚀" });
});

/* ========================= */
/* 🔎 STATION SEARCH */
/* ========================= */
app.get("/api/stations", (req, res) => {
  const search = req.query.search;

  if (!search) return res.json([]);

  try {
    const stmt = db.prepare(`
      SELECT code, name, state
      FROM stations
      WHERE name LIKE ? OR code LIKE ?
      LIMIT 10
    `);

    const results = stmt.all(`%${search}%`, `%${search}%`);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* ========================= */
/* SERVER START */
/* ========================= */
app.listen(PORT, () => {
  console.log("RailPulse running on port " + PORT);
});
