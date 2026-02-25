const express = require('express');
const compression = require('compression');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(compression());
app.use(cors());
app.use(express.json());

// Fixed MIME types for static assets
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
        if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
    }
}));

// Data Variables
let stations = [];
let schedules = [];

// REPLACE THIS with your Google Drive Direct Download Link
// It must look like: https://docs.google.com/uc?export=download&id=YOUR_FILE_ID
const SCHEDULE_URL = "https://drive.google.com/uc?export=download&id=1O8sx5NvLP3G9Z2mj0fYwLnXJ3AvKopXP";

// Load Data Function
async function initData() {
    try {
        // Load local stations (smaller file)
        stations = JSON.parse(fs.readFileSync('./data/stations.json', 'utf8'));
        console.log(`✅ Loaded ${stations.length} stations locally.`);

        // Load large schedules from GDrive
        console.log("⏳ Fetching massive schedules.json from GDrive...");
        const response = await axios.get(SCHEDULE_URL);
        schedules = response.data;
        console.log(`✅ Loaded ${schedules.length} schedules from Remote Source.`);
    } catch (error) {
        console.error("❌ Data Load Error:", error.message);
        // Fallback to local file if GDrive fails
        if (fs.existsSync('./data/schedules.json')) {
            schedules = JSON.parse(fs.readFileSync('./data/schedules.json', 'utf8'));
            console.log("⚠️ Using local fallback for schedules.");
        }
    }
}

// API: Autocomplete (matches your app.js logic)
app.get('/api/stations/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    const results = stations.filter(s => 
        s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query)
    ).slice(0, 15);
    res.json(results);
});

// API: Search Trains (matches your trains logic)
app.get('/api/trains/find', (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: "Missing parameters" });

    const fCode = from.toUpperCase();
    const tCode = to.toUpperCase();

    const results = schedules.filter(train => {
        const stops = train.stops.map(s => s.station_code.toUpperCase());
        const fIdx = stops.indexOf(fCode);
        const tIdx = stops.indexOf(tCode);
        return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx;
    });
    res.json(results);
});

// Health check to see if data is loaded
app.get('/api/status', (req, res) => {
    res.json({ stations: stations.length, schedules: schedules.length });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Server active on port ${PORT}`);
    await initData();
});
