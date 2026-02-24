require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Load data into memory once for speed
const stations = JSON.parse(fs.readFileSync('./data/stations.json', 'utf8'));
const schedules = JSON.parse(fs.readFileSync('./data/schedules.json', 'utf8'));

// 1. Station Autocomplete Logic (Matches Image 1 & 2)
app.get('/api/stations', (req, res) => {
    const query = req.query.q ? req.query.q.toUpperCase() : '';
    const filtered = stations.filter(s => 
        s.name.toUpperCase().includes(query) || s.code.toUpperCase().includes(query)
    ).slice(0, 6);
    res.json(filtered);
});

// 2. Search Trains between 2 Stations (Matches Image 3)
app.get('/api/search-trains', (req, res) => {
    const { from, to } = req.query;
    // Filters schedules for trains containing both station codes in their stop list
    const results = schedules.filter(train => {
        const stops = train.stops.map(stop => stop.station_code);
        return stops.includes(from) && stops.includes(to) && 
               stops.indexOf(from) < stops.indexOf(to); // Ensure correct direction
    });
    res.json(results);
});

// 3. Live Tracking (Matches Image 4 - requires RapidAPI)
app.get('/api/live-status/:trainNo', async (req, res) => {
    try {
        const options = {
            method: 'GET',
            url: 'https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/train/status',
            params: { train_number: req.params.trainNo },
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': 'indian-railway-irctc.p.rapidapi.com'
            }
        };
        const response = await axios.request(options);
        res.json(response.data);
    } catch (err) { res.status(500).json({ error: "API limit or connection issue" }); }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
