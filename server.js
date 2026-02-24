// Ensure this is at the top of your server.js
const STATIONS_PATH = path.join(__dirname, 'data', 'stations.json');

app.get('/api/stations', (req, res) => {
    try {
        const query = req.query.q ? req.query.q.toUpperCase() : '';
        // Reading file inside the route to save memory on Render Free Tier
        const stations = JSON.parse(fs.readFileSync(STATIONS_PATH, 'utf8'));
        
        const filtered = stations.filter(s => 
            s.name.toUpperCase().includes(query) || 
            s.code.toUpperCase().includes(query)
        ).slice(0, 8); // Limit to 8 results for mobile UI
        
        res.json(filtered);
    } catch (err) {
        console.error("Autocomplete Error:", err);
        res.status(500).json([]);
    }
});
