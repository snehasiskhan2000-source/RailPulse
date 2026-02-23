const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.static('public'));

// Heartbeat for Uptime Robot
app.get('/healthz', (req, res) => res.status(200).send('RailPulse Active'));

app.get('/api/status', async (req, res) => {
    const { trainNo, date } = req.query;
    
    const options = {
        method: 'GET',
        url: 'https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/train/status',
        params: {
            train_number: trainNo,
            departure_date: date, // YYYYMMDD
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
        res.json(response.data);
    } catch (error) {
        // Forward the exact error from RapidAPI to the frontend
        const status = error.response ? error.response.status : 500;
        const data = error.response ? error.response.data : { message: "Internal Error" };
        res.status(status).json(data);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('RailPulse Engine Online'));
