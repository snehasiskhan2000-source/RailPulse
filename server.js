const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.static('public'));

// UptimeRobot Health Check
app.get('/healthz', (req, res) => res.status(200).send('RailPulse Active'));

app.get('/api/status', async (req, res) => {
    const { trainNo, date } = req.query;
    
    const options = {
        method: 'GET',
        url: 'https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/train/status',
        params: {
            train_number: trainNo,
            departure_date: date, // Must be YYYYMMDD
            isH5: 'true',
            client: 'web'
        },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'indian-railway-irctc.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        // We send the whole response to debug on frontend
        res.json(response.data);
    } catch (error) {
        console.error("API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'API Connection Failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RailPulse running on port ${PORT}`));
