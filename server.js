const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();

app.use(express.static('public'));

const RAPID_API_KEY = process.env.RAPIDAPI_KEY; // YOUR FULL RAPIDAPI KEY
const API_HOST = "indian-railway-irctc.p.rapidapi.com";

let schedules = [];
const stations = JSON.parse(fs.readFileSync('./data/stations.json', 'utf8'));

// Fetch your GDrive Schedule file here
async function loadSchedules() {
    try {
        const res = await axios.get("https://drive.google.com/uc?export=download&id=1_9g-7LTRWUMkp3219RGBQ1POpXwnPFws");
        schedules = res.data;
    } catch (e) { console.log("Schedule Load Error"); }
}
loadSchedules();

app.get('/api/stations/search', (req, res) => {
    const q = req.query.q.toLowerCase();
    res.json(stations.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)).slice(0, 10));
});

app.get('/api/trains/find', (req, res) => {
    const { from, to } = req.query;
    const matches = schedules.filter(t => {
        const codes = t.stops.map(s => s.station_code);
        const fIdx = codes.indexOf(from);
        const tIdx = codes.indexOf(to);
        return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx;
    });
    res.json(matches);
});

app.get('/api/train/live/:num', async (req, res) => {
    try {
        const response = await axios.get('https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/train/status', {
            params: { train_number: req.params.num, departure_date: '20260225', client: 'web' },
            headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': API_HOST }
        });
        res.json(response.data);
    } catch (e) { res.status(500).send(); }
});

app.listen(3000, () => console.log("Server running"));
