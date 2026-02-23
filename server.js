const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.static('public'));

const config = {
    headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'indian-railway-irctc.p.rapidapi.com'
    }
};

// Autocomplete Endpoint
app.get('/api/search-station', async (req, res) => {
    try {
        const response = await axios.get(`https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/station/search?query=${req.query.q}`, config);
        // We return the body which contains the list of stations
        res.json(response.data.body || []);
    } catch (e) {
        res.status(500).json([]);
    }
});

// Find Trains Between Stations
app.get('/api/find-trains', async (req, res) => {
    const { from, to } = req.query;
    try {
        const response = await axios.get(`https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/trainsBetweenStations?fromStationCode=${from}&toStationCode=${to}`, config);
        res.json(response.data.body?.trains || []);
    } catch (e) {
        res.status(500).json([]);
    }
});

// Live Status
app.get('/api/status', async (req, res) => {
    const { trainNo, date } = req.query;
    try {
        const response = await axios.get(`https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/train/status?train_number=${trainNo}&departure_date=${date}&isH5=true&client=web`, config);
        res.json(response.data);
    } catch (e) {
        res.status(500).json({ status: { result: "failure" } });
    }
});

app.listen(3000, () => console.log('RailPulse Pro Engine Running'));
