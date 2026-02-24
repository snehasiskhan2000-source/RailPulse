const fs = require("fs");
const Database = require("better-sqlite3");
const { parser } = require("stream-json");
const { streamArray } = require("stream-json/streamers/StreamArray");

const SCHEDULE_URL = "https://drive.google.com/uc?export=download&id=1O8sx5NvLP3G9Z2mj0fYwLnXJ3AvKopXP";

async function downloadSchedules() {
  console.log("Downloading schedules.json from Google Drive...");
  const response = await fetch(SCHEDULE_URL);

  if (!response.ok) {
    throw new Error("Failed to download schedules.json");
  }

  const fileStream = fs.createWriteStream("schedules.json");

  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on("error", reject);
    fileStream.on("finish", resolve);
  });

  console.log("Download complete.");
}

async function buildDatabase() {

  await downloadSchedules();

  const db = new Database("railpulse.db");

  console.log("Creating tables...");

  db.exec(`
    DROP TABLE IF EXISTS stations;
    DROP TABLE IF EXISTS trains;
    DROP TABLE IF EXISTS schedules;

    CREATE TABLE stations (
      station_code TEXT PRIMARY KEY,
      station_name TEXT
    );

    CREATE TABLE trains (
      train_number TEXT PRIMARY KEY,
      train_name TEXT
    );

    CREATE TABLE schedules (
      train_number TEXT,
      station_code TEXT,
      arrival TEXT,
      departure TEXT,
      stop_sequence INTEGER
    );

    CREATE INDEX idx_train ON schedules(train_number);
    CREATE INDEX idx_station ON schedules(station_code);
  `);

  console.log("Importing stations...");
  const stations = JSON.parse(fs.readFileSync("railways-master/stations.json"));
  const insertStation = db.prepare("INSERT INTO stations VALUES (?, ?)");
  stations.forEach(s => {
    insertStation.run(s.station_code, s.station_name);
  });

  console.log("Importing trains...");
  const trains = JSON.parse(fs.readFileSync("railways-master/trains.json"));
  const insertTrain = db.prepare("INSERT INTO trains VALUES (?, ?)");
  trains.forEach(t => {
    insertTrain.run(t.train_number, t.train_name);
  });

  console.log("Streaming schedules (this may take a few minutes)...");

  const insertSchedule = db.prepare(
    "INSERT INTO schedules VALUES (?, ?, ?, ?, ?)"
  );

  const pipeline = fs.createReadStream("schedules.json")
    .pipe(parser())
    .pipe(streamArray());

  pipeline.on("data", ({ value }) => {
    insertSchedule.run(
      value.train_number,
      value.station_code,
      value.arrival,
      value.departure,
      value.stop_sequence
    );
  });

  pipeline.on("end", () => {
    console.log("Database built successfully 🚄");
    fs.unlinkSync("schedules.json");
  });
}

buildDatabase();
