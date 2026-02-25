const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

// --- CONFIGURATION ---
// 1. Replace with your actual Google Drive File ID
const SCHEDULE_URL = "https://drive.google.com/uc?export=download&id=1_9g-7LTRWUMkp3219RGBQ1POpXwnPFws";

// 2. Replace with your full RapidAPI Key from your screenshot
const RAPID_API_KEY = "96e8e0..."; 
const RAPID_API_HOST = "indian-railway-irctc.p.rapidapi.com";

let schedules = [];
let stations = [];

// Load Local Stations (For Autocomplete)
try {
    stations = JSON.parse(fs.readFileSync('./data/stations.json', 'utf8'));
    console.log(`✅ ${stations.length} stations loaded locally.`);
} catch (e) {
    console.error("❌ Error loading stations.json");
}

// Load Remote Schedules (For Search)
async function loadSchedules() {
    try {
        const res = await axios.get(SCHEDULE_URL);
        schedules = res.data;
        console.log(`✅ ${schedules.length} schedules loaded from GDrive.`);
    } catch (e) {
        console.error("❌ GDrive Load Failed:", e.message);
    }
}
loadSchedules();

// --- API ROUTES ---

// 1. Station Autocomplete
app.get('/api/stations/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    if (query.length < 2) return res.json([]);
    const matches = stations.filter(s => 
        s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query)
    ).slice(0, 10);
    res.json(matches);
});

// 2. Train Search
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

// 3. RapidAPI Live Status Proxy
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
        res.status(500).json({ error: "API Error" });
    }
});

app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
