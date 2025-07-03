const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/stockdata', async (req, res) => {
  
    const symbol = req.query.symbol || 'IBM';

    if (!symbol) {
        return res.status(400).json({ error: 'error' });
    }

    try {
        const apiKey = '6GPBO86PLOFY3HU8'; 


        const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`);

        res.json(response.data);

    } catch (error) {
        console.error('API:レート制限が来ました', error.message);
        res.status(500).json({ error: 'error' });
    }
});

app.listen(port, () => {
  console.log(` http://localhost:${port} にアクセスしてください`);
});

