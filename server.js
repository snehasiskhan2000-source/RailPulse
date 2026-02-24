require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.static('public'));

// Path to your downloaded GDrive file
const SCHEDULES_PATH = path.join(__dirname, 'data', 'schedules.json');
let schedules = [];

// Load data safely
if (fs.existsSync(SCHEDULES_PATH)) {
    schedules = JSON.parse(fs.readFileSync(SCHEDULES_PATH, 'utf8'));
}

// 1. Station Autocomplete Logic
app.get('/api/stations', (req, res) => {
    const query = req.query.q.toUpperCase();
    // Assuming stations.json is small enough for GitHub, otherwise use same GDrive trick
    const stations = JSON.parse(fs.readFileSync('./data/stations.json', 'utf8'));
    const filtered = stations.filter(s => 
        s.name.toUpperCase().includes(query) || s.code.toUpperCase().includes(query)
    ).slice(0, 8);
    res.json(filtered);
});

// 2. Search Trains (Matching Image 3)
app.get('/api/search', (req, res) => {
    const { from, to } = req.query;
    const results = schedules.filter(train => {
        const stops = train.stops.map(s => s.station_code);
        const fromIdx = stops.indexOf(from);
        const toIdx = stops.indexOf(to);
        return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
    });
    res.json(results);
});

// 3. Live Tracking (RapidAPI)
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
        res.status(500).json({ error: "Live tracking currently unavailable" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server active on port ${PORT}`));
