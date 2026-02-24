require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Station Search API (Autocomplete)
app.get('/api/stations', (req, res) => {
    const query = req.query.q ? req.query.q.toUpperCase() : '';
    const stationsPath = path.join(__dirname, 'data', 'stations.json');
    
    fs.readFile(stationsPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Data file missing" });
        const stations = JSON.parse(data);
        const filtered = stations.filter(s => 
            s.name.toUpperCase().includes(query) || s.code.toUpperCase().includes(query)
        ).slice(0, 8);
        res.json(filtered);
    });
});

// 2. Live Train Status (RapidAPI)
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
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch live data" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
