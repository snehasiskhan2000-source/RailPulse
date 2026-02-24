const fs = require("fs");
const fetch = require("node-fetch");
const Database = require("better-sqlite3");
const { parser } = require("stream-json");
const { streamArray } = require("stream-json/streamers/StreamArray");

const SCHEDULE_URL = "https://drive.google.com/uc?export=download&id=1O8sx5NvLP3G9Z2mj0fYwLnXJ3AvKopXP";

async function downloadFile() {
  console.log("Downloading schedules.json...");
  const res = await fetch(SCHEDULE_URL);
  const fileStream = fs.createWriteStream("schedules.json");
  await new Promise((resolve) => {
    res.body.pipe(fileStream);
    res.body.on("end", resolve);
  });
  console.log("Download complete.");
}

async function build() {

  await downloadFile();

  const db = new Database("railpulse.db");

  db.exec(`
  CREATE TABLE IF NOT EXISTS schedules (
    train_number TEXT,
    station_code TEXT,
    arrival TEXT,
    departure TEXT,
    stop_sequence INTEGER
  );
  `);

  const insert = db.prepare(`
    INSERT INTO schedules VALUES (?, ?, ?, ?, ?)
  `);

  const pipeline = fs.createReadStream("schedules.json")
    .pipe(parser())
    .pipe(streamArray());

  pipeline.on("data", ({ value }) => {
    insert.run(
      value.train_number,
      value.station_code,
      value.arrival,
      value.departure,
      value.stop_sequence
    );
  });

  pipeline.on("end", () => {
    console.log("Database built 🚄");
    fs.unlinkSync("schedules.json");
  });
}

build();
