require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static('public'));

// Path to your data folder on Render
const STATIONS_PATH = path.join(__dirname, 'data', 'stations.json');
const SCHEDULES_PATH = path.join(__dirname, 'data', 'schedules.json');

// Autocomplete API
app.get('/api/stations', (req, res) => {
    try {
        const query = (req.query.q || '').toUpperCase();
        const stations = JSON.parse(fs.readFileSync(STATIONS_PATH, 'utf8'));
        const filtered = stations.filter(s => 
            s.name.toUpperCase().includes(query) || s.code.toUpperCase().includes(query)
        ).slice(0, 8);
        res.json(filtered);
    } catch (err) {
        console.error("Station API Error:", err);
        res.json([]);
    }
});

// Train Search API
app.get('/api/search', (req, res) => {
    try {
        const { from, to } = req.query;
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
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
