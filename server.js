require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// 1. Fast Autocomplete using stations.json
app.get('/api/stations', (req, res) => {
    const query = req.query.q.toUpperCase();
    const stations = JSON.parse(fs.readFileSync('./data/stations.json', 'utf8'));
    const filtered = stations.filter(s => 
        s.name.toUpperCase().includes(query) || s.code.toUpperCase().includes(query)
    ).slice(0, 6); // Limit results for mobile UI
    res.json(filtered);
});

// 2. Search Trains between stations using schedules.json
app.get('/api/search-trains', (req, res) => {
    const { from, to } = req.query;
    const schedules = JSON.parse(fs.readFileSync('./data/schedules.json', 'utf8'));
    
    // Logic to find trains that stop at BOTH 'from' and 'to' station codes
    const results = schedules.filter(train => {
        const hasFrom = train.stops.some(stop => stop.station_code === from);
        const hasTo = train.stops.some(stop => stop.station_code === to);
        return hasFrom && hasTo;
    });
    res.json(results);
});

// 3. Live Tracking (RapidAPI)
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
    } catch (err) { res.status(500).json({ error: "API Error" }); }
});

app.listen(PORT, () => console.log(`Server on ${PORT}`));
