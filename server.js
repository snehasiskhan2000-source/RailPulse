const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- CONFIGURATION ---
// Replace 'YOUR_FILE_ID_HERE' with the ID from your Google Drive link
const SCHEDULE_URL = "https://drive.google.com/uc?export=download&id=1_9g-7LTRWUMkp3219RGBQ1POpXwnPFws";
const STATIONS_PATH = path.join(__dirname, 'data', 'stations.json');

let schedules = [];
let stations = [];

// 1. Load Local Stations (For Autocomplete)
try {
    if (fs.existsSync(STATIONS_PATH)) {
        stations = JSON.parse(fs.readFileSync(STATIONS_PATH, 'utf8'));
        console.log(`✅ Loaded ${stations.length} stations from local storage`);
    } else {
        console.error("❌ stations.json not found in data folder");
    }
} catch (err) {
    console.error("❌ Error parsing stations.json:", err.message);
}

// 2. Load Remote Schedules (For Train Search)
async function loadSchedules() {
    try {
        console.log("⏳ Fetching schedules from Google Drive...");
        const response = await axios.get(SCHEDULE_URL);
        schedules = response.data;
        console.log(`✅ Loaded ${schedules.length} train schedules successfully`);
    } catch (err) {
        console.error("❌ Failed to load remote schedules:", err.message);
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
    ).slice(0, 15); // Limit to 15 results for speed

    res.json(matches);
});

// Train Search Route
app.get('/api/trains/find', (req, res) => {
    const fromCode = req.query.from?.toUpperCase();
    const toCode = req.query.to?.toUpperCase();

    if (!fromCode || !toCode) {
        return res.status(400).json({ error: "Source and Destination are required" });
    }

    const results = schedules.filter(train => {
        const stopCodes = train.stops.map(s => s.station_code.toUpperCase());
        const fromIdx = stopCodes.indexOf(fromCode);
        const toIdx = stopCodes.indexOf(toCode);

        // Logic: Both stations must exist, and 'From' must come before 'To'
        return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
    });

    res.json(results);
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
