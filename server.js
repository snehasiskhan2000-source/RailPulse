require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Explicit data paths
const DATA_DIR = path.join(__dirname, 'data');
const STATIONS_FILE = path.join(DATA_DIR, 'stations.json');
const SCHEDULES_FILE = path.join(DATA_DIR, 'schedules.json');

// Autocomplete API
app.get('/api/stations', (req, res) => {
    try {
        const query = (req.query.q || '').toUpperCase();
        if (!fs.existsSync(STATIONS_FILE)) return res.json([]);
        
        const stations = JSON.parse(fs.readFileSync(STATIONS_FILE, 'utf8'));
        const filtered = stations.filter(s => 
            s.name.toUpperCase().includes(query) || s.code.toUpperCase().includes(query)
        ).slice(0, 10);
        
        res.json(filtered);
    } catch (err) {
        res.status(500).json([]);
    }
});

// Train Search API
app.get('/api/search', (req, res) => {
    try {
        const { from, to } = req.query;
        if (!fs.existsSync(SCHEDULES_FILE)) return res.status(404).json({ error: "Syncing..." });

        const schedules = JSON.parse(fs.readFileSync(SCHEDULES_FILE, 'utf8'));
        const results = schedules.filter(train => {
            const codes = train.stops.map(s => s.station_code);
            const fIdx = codes.indexOf(from);
            const tIdx = codes.indexOf(to);
            return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx;
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Search failed" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Professional Server Live on ${PORT}`));
