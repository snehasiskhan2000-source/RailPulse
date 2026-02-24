require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Professional static file handling
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Path Constants based on your structure
const DATA_DIR = path.join(__dirname, 'data');
const STATIONS_PATH = path.join(DATA_DIR, 'stations.json');
const SCHEDULES_PATH = path.join(DATA_DIR, 'schedules.json');

// API: Professional Station Autocomplete
app.get('/api/stations', (req, res) => {
    try {
        const query = (req.query.q || '').toUpperCase();
        if (!fs.existsSync(STATIONS_PATH)) return res.json([]);
        
        const stations = JSON.parse(fs.readFileSync(STATIONS_PATH, 'utf8'));
        const filtered = stations.filter(s => 
            s.name.toUpperCase().includes(query) || s.code.toUpperCase().includes(query)
        ).slice(0, 10);
        
        res.json(filtered);
    } catch (err) {
        console.error("Autocomplete Error:", err);
        res.status(500).json([]);
    }
});

// API: High-Performance Train Search
app.get('/api/search', (req, res) => {
    try {
        const { from, to } = req.query;
        if (!fs.existsSync(SCHEDULES_PATH)) return res.status(404).json({ error: "Database Syncing" });

        const schedules = JSON.parse(fs.readFileSync(SCHEDULES_PATH, 'utf8'));
        const results = schedules.filter(train => {
            const stops = train.stops.map(s => s.station_code);
            const fIdx = stops.indexOf(from);
            const tIdx = stops.indexOf(to);
            return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx;
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Professional Server Live on ${PORT}`));
