require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.static('public'));

// Direct paths to your verified data folder
const STATIONS_PATH = path.join(__dirname, 'data', 'stations.json');

app.get('/api/stations', (req, res) => {
    try {
        const query = (req.query.q || '').toUpperCase();
        console.log(`Searching for: ${query}`); // You will see this in Render logs
        
        const stations = JSON.parse(fs.readFileSync(STATIONS_PATH, 'utf8'));
        const filtered = stations.filter(s => 
            s.name.toUpperCase().includes(query) || s.code.toUpperCase().includes(query)
        ).slice(0, 10);
        
        res.json(filtered);
    } catch (err) {
        console.error("Backend Error:", err);
        res.status(500).json({ error: "Cannot read stations" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
