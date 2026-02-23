const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.static('public'));

const RAPID_CONFIG = {
    headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'indian-railway-irctc.p.rapidapi.com'
    }
};

// 1. Station Suggestion
app.get('/api/search-station', async (req, res) => {
    try {
        const response = await axios.get(`https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/station/search?query=${req.query.q}`, RAPID_CONFIG);
        res.json(response.data);
    } catch (e) { res.status(500).json({ error: true }); }
});

// 2. Find Trains between Stations
app.get('/api/find-trains', async (req, res) => {
    try {
        const { from, to } = req.query;
        const response = await axios.get(`https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/trainsBetweenStations?fromStationCode=${from}&toStationCode=${to}`, RAPID_CONFIG);
        res.json(response.data);
    } catch (e) { res.status(500).json({ error: true }); }
});

// 3. Live Status
app.get('/api/status', async (req, res) => {
    try {
        const { trainNo, date } = req.query;
        const response = await axios.get(`https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/train/status?train_number=${trainNo}&departure_date=${date}&isH5=true&client=web`, RAPID_CONFIG);
        res.json(response.data);
    } catch (e) { res.status(500).json({ error: true }); }
});

app.listen(3000, () => console.log('RailPulse Engine Online'));
