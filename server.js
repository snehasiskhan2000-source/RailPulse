const express = require('express');
const compression = require('compression');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for performance and security
app.use(compression());
app.use(cors());
app.use(express.json());

// Serve static files with explicit MIME types to fix "Strict MIME" errors
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
        if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
    }
}));

// Mock Data Loading (Replace with your JSON files)
const loadData = (file) => {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', file), 'utf8'));
    } catch (e) {
        console.error(`Error loading ${file}:`, e.message);
        return [];
    }
};

const stations = loadData('stations.json');
const trains = loadData('trains.json');

// API: Live Autocomplete
app.get('/api/stations/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    const matches = stations.filter(s => 
        s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query)
    ).slice(0, 10);
    res.json(matches);
});

// API: Find Trains
app.get('/api/trains/find', (req, res) => {
    const { from, to } = req.query;
    const results = trains.filter(t => {
        const codes = t.stops.map(s => s.station_code.toUpperCase());
        const fIdx = codes.indexOf(from.toUpperCase());
        const tIdx = codes.indexOf(to.toUpperCase());
        return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx;
    });
    res.json(results);
});

// SPA Fallback
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\ud83d\ude82 RailPulse Server running on http://localhost:${PORT}`);
});
