const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// CONFIGURATION
// Use your Google Drive File ID here
const SCHEDULE_URL = "https://drive.google.com/uc?export=download&id=1_9g-7LTRWUMkp3219RGBQ1POpXwnPFws";
const STATIONS_PATH = path.join(__dirname, 'data', 'stations.json');

let schedules = [];
let stations = [];

// 1. Load Stations for Autocomplete (Local)
try {
    const rawData = fs.readFileSync(STATIONS_PATH, 'utf8');
    stations = JSON.parse(rawData);
    console.log(`✅ Loaded ${stations.length} stations for autocomplete.`);
} catch (err) {
    console.error("❌ Error loading stations.json:", err.message);
}

// 2. Load Schedules (Remote from GDrive)
async function loadSchedules() {
    try {
        console.log("⏳ Fetching 21MB schedule database...");
        const response = await axios.get(SCHEDULE_URL);
        schedules = response.data;
        console.log(`✅ Success: ${schedules.length} train schedules loaded.`);
    } catch (err) {
        console.error("❌ Failed to load schedules from GDrive:", err.message);
    }
}
loadSchedules();

// --- API ROUTES ---

// Autocomplete Route
app.get('/api/stations/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    if (query.length < 2) return res.json([]);

    const matches = stations.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.code.toLowerCase().includes(query)
    ).slice(0, 15);
    res.json(matches);
});

// Train Search Route
app.get('/api/trains/find', (req, res) => {
    const from = req.query.from?.trim().toUpperCase();
    const to = req.query.to?.trim().toUpperCase();

    if (!from || !to) return res.json([]);

    // Filter trains that stop at both stations in the correct order
    const results = schedules.filter(train => {
        const stopCodes = train.stops.map(s => s.station_code.toUpperCase());
        const fromIdx = stopCodes.indexOf(from);
        const toIdx = stopCodes.indexOf(to);
        
        return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
    });

    res.json(results);
});

app.listen(PORT, () => console.log(`🚀 Server active on port ${PORT}`));
