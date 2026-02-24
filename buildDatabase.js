const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = path.join(__dirname, "..", "railpulse.db");
const STATIONS_PATH = path.join(__dirname, "..", "stations.json");

async function buildDatabase() {
  console.log("Opening database...");

  const db = new sqlite3.Database(DB_PATH);

  db.serialize(() => {
    console.log("Creating tables...");

    db.run(`
      CREATE TABLE IF NOT EXISTS stations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE,
        name TEXT,
        state TEXT,
        zone TEXT,
        address TEXT,
        latitude REAL,
        longitude REAL
      )
    `);

    console.log("Reading stations.json...");

    const raw = fs.readFileSync(STATIONS_PATH, "utf8");
    const geojson = JSON.parse(raw);

    if (!geojson.features || !Array.isArray(geojson.features)) {
      console.error("Invalid GeoJSON format");
      process.exit(1);
    }

    const stations = geojson.features;

    console.log(`Importing ${stations.length} stations...`);

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO stations
      (code, name, state, zone, address, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stations.forEach((feature) => {
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

      stmt.run(
        props.code || null,
        props.name || null,
        props.state || null,
        props.zone || null,
        props.address || null,
        lat,
        lon
      );
    });

    stmt.finalize();

    console.log("✅ Stations imported successfully!");
  });

  db.close();
}

buildDatabase();
