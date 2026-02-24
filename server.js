require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static('public'));

// Path helpers
const STATIONS_PATH = path.join(__dirname, 'data', 'stations.json');
const SCHEDULES_PATH = path.join(__dirname, 'data', 'schedules.json');

// 1. Instant Autocomplete (Uses the 1.86MB file)
app.get('/api/stations', (req, res) => {
    try {
        const query = req.query.q ? req.query.q.toUpperCase() : '';
        const stations = JSON.parse(fs.readFileSync(STATIONS_PATH, 'utf8'));
        const filtered = stations.filter(s => 
            s.name.toUpperCase().includes(query) || s.code.toUpperCase().includes(query)
        ).slice(0, 8);
        res.json(filtered);
    } catch (err) {
        res.status(500).json({ error: "Station data not found" });
    }
});

// 2. Memory-Safe Search (Reads 82MB file only on click)
app.get('/api/search', (req, res) => {
    try {
        const { from, to } = req.query;
        if (!fs.existsSync(SCHEDULES_PATH)) return res.status(404).json({ error: "Database downloading, try in 10s" });

        // Stream or Read file only when searched to save RAM
        const schedules = JSON.parse(fs.readFileSync(SCHEDULES_PATH, 'utf8'));
        const results = schedules.filter(train => {
            const stops = train.stops.map(s => s.station_code);
            const fIdx = stops.indexOf(from);
            const tIdx = stops.indexOf(to);
            return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx;
        });
        res.json(results.slice(0, 20)); // Limit results for mobile speed
    } catch (err) {
        res.status(500).json({ error: "Search failed" });
    }
});

// 3. Live tracking using your host
app.get('/api/live/:trainNo', async (req, res) => {
    try {
        const response = await axios.get('https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/train/status', {
            params: { train_number: req.params.trainNo },
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': 'indian-railway-irctc.p.rapidapi.com'
            }
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: "Live API Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
