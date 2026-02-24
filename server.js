require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.static('public'));

const DATA_DIR = path.join(__dirname, 'data');
const STATIONS_PATH = path.join(DATA_DIR, 'stations.json');
const SCHEDULES_PATH = path.join(DATA_DIR, 'schedules.json');

// 1. Station Autocomplete
app.get('/api/stations', (req, res) => {
    try {
        const query = req.query.q ? req.query.q.toUpperCase() : '';
        const stations = JSON.parse(fs.readFileSync(STATIONS_PATH, 'utf8'));
        const filtered = stations.filter(s => 
            s.name.toUpperCase().includes(query) || s.code.toUpperCase().includes(query)
        ).slice(0, 8);
        res.json(filtered);
    } catch (err) {
        res.status(500).json([]);
    }
});

// 2. Search Trains between stations (Matches Image 3)
app.get('/api/search', (req, res) => {
    try {
        const { from, to } = req.query;
        if (!fs.existsSync(SCHEDULES_PATH)) return res.status(404).json({ error: "Syncing DB..." });

        const schedules = JSON.parse(fs.readFileSync(SCHEDULES_PATH, 'utf8'));
        const results = schedules.filter(train => {
            const stops = train.stops.map(s => s.station_code);
            const fIdx = stops.indexOf(from);
            const tIdx = stops.indexOf(to);
            return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx;
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Search failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
