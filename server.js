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

// --- CONFIGURATION ---
// Replace with your Google Drive File ID for schedules.json
const SCHEDULE_URL = "https://drive.google.com/uc?export=download&id=1_9g-7LTRWUMkp3219RGBQ1POpXwnPFws";

// Use the Key and Host from your RapidAPI screenshot
const RAPID_API_KEY = "96e8e0..."; 
const RAPID_API_HOST = "indian-railway-irctc.p.rapidapi.com";

let schedules = [];
let stations = [];

// 1. Load Local Stations (For Autocomplete)
try {
    const stationsPath = path.join(__dirname, 'data', 'stations.json');
    stations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
    console.log(`✅ Loaded ${stations.length} stations from local storage`);
} catch (err) {
    console.error("❌ Error loading stations.json:", err.message);
}

// 2. Load Remote Schedules (For Search)
async function loadSchedules() {
    try {
        console.log("⏳ Fetching schedule database from GDrive...");
        const response = await axios.get(SCHEDULE_URL);
        schedules = response.data;
        console.log(`✅ Loaded ${schedules.length} train schedules`);
    } catch (err) {
        console.error("❌ Failed to load schedules:", err.message);
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
    ).slice(0, 10);
    res.json(matches);
});

// Train Search Route
app.get('/api/trains/find', (req, res) => {
    const from = req.query.from?.toUpperCase();
    const to = req.query.to?.toUpperCase();

    const results = schedules.filter(train => {
        const codes = train.stops.map(s => s.station_code.toUpperCase());
        const fIdx = codes.indexOf(from);
        const tIdx = codes.indexOf(to);
        return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx;
    });
    res.json(results);
});

// Live Train Status Proxy
app.get('/api/train/live/:trainNo', async (req, res) => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    const options = {
        method: 'GET',
        url: 'https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/train/status',
        params: {
            departure_date: today,
            isH5: 'true',
            client: 'web',
            deviceIdentifier: 'Mozilla/5.0',
            train_number: req.params.trainNo
        },
        headers: {
            'x-rapidapi-key': RAPID_API_KEY,
            'x-rapidapi-host': RAPID_API_HOST
        }
    };

    try {
        const response = await axios.request(options);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Live tracking failed" });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
