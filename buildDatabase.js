const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "railpulse.db");
const STATIONS_PATH = path.join(__dirname, "railways-master", "stations.json");

console.log("Opening database...");
const db = new Database(DB_PATH);

console.log("Creating tables...");

db.exec(`
  CREATE TABLE IF NOT EXISTS stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    name TEXT,
    state TEXT,
    zone TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL
  );
`);

console.log("Reading stations.json...");

const raw = fs.readFileSync(STATIONS_PATH, "utf8");
const geojson = JSON.parse(raw);

if (!geojson.features || !Array.isArray(geojson.features)) {
  console.error("Invalid GeoJSON format");
  process.exit(1);
}

const insert = db.prepare(`
  INSERT OR IGNORE INTO stations
  (code, name, state, zone, address, latitude, longitude)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((stations) => {
  for (const feature of stations) {
    const props = feature.properties || {};
    const geometry = feature.geometry;

    let lat = null;
    let lon = null;

    if (
      geometry &&
      geometry.type === "Point" &&
      Array.isArray(geometry.coordinates)
    ) {
      lon = geometry.coordinates[0];
      lat = geometry.coordinates[1];
    }

    insert.run(
      props.code || null,
      props.name || null,
      props.state || null,
      props.zone || null,
      props.address || null,
      lat,
      lon
    );
  }
});

console.log(`Importing ${geojson.features.length} stations...`);
insertMany(geojson.features);

console.log("✅ Stations imported successfully!");
db.close();
