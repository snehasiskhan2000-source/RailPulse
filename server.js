const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.static('public'));

app.get('/healthz', (req, res) => res.status(200).send('RailPulse Active'));

app.get('/api/status', async (req, res) => {
    const { trainNo, date } = req.query;
    
    console.log(`RailPulse Query: Train ${trainNo} on Date ${date}`);

    const options = {
        method: 'GET',
        url: 'https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/train/status',
        params: {
            train_number: trainNo,
            departure_date: date,
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
        console.error("RapidAPI Error Detail:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'API Error', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('RailPulse Engine Started'));
