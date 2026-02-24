const express = require("express");
const Database = require("better-sqlite3");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database("railpulse.db");

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Station Autocomplete
app.get("/api/stations", (req, res) => {
  const q = req.query.q || "";
  const result = db.prepare(`
    SELECT * FROM stations
    WHERE station_name LIKE ?
    LIMIT 10
  `).all(`%${q}%`);
  res.json(result);
});

// Search trains between stations
app.get("/api/search", (req, res) => {
  const { from, to } = req.query;

  const trains = db.prepare(`
    SELECT DISTINCT s1.train_number
    FROM schedules s1
    JOIN schedules s2
      ON s1.train_number = s2.train_number
    WHERE s1.station_code = ?
      AND s2.station_code = ?
      AND s1.stop_sequence < s2.stop_sequence
  `).all(from, to);

  res.json(trains);
});

// Full timetable of a train
app.get("/api/train/:trainNo", (req, res) => {
  const trainNo = req.params.trainNo;

  const schedule = db.prepare(`
    SELECT * FROM schedules
    WHERE train_number = ?
    ORDER BY stop_sequence
  `).all(trainNo);

  res.json(schedule);
});

app.listen(10000, () =>
  console.log("RailPulse Server Running 🚄")
);
