const express = require('express');
const axios = require('axios');
const path = require('path');
const { calculatePrediction } = require('./prediction.js');
const app = express();
const port = 3000;


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'start.html'));
});

// publicフォルダ内の静的ファイル(css, js, chart.htmlなど)を提供
app.use(express.static('public'));

// /chart にアクセスがあったら、チャートページを表示
app.get('/chart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chart.html'));
});


app.get('/api/predict', async (req, res) => {
    const symbol = req.query.symbol || 'IBM';

    if (!symbol) {
        return res.status(400).json({ error: '銘柄コードが指定されていません' });
    }

    try {
        const apiKey = '6GPBO86PLOFY3HU8'; 
        const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`);
        const data = response.data;

        if (!data['Time Series (Daily)']) {
            let errorMessage = `銘柄コード「${symbol}」のデータが見つかりません。`;
            if (data['Note']) {
                errorMessage = 'APIの利用制限に達したようです。\nしばらく待ってから、再度お試しください。';
            }
            return res.status(404).json({ error: errorMessage });
        }

        const timeSeries = data['Time Series (Daily)'];
        const result = calculatePrediction(timeSeries);
        res.json(result);

    } catch (error) {
        console.error('APIリクエストまたはデータ処理でエラーが発生しました:', error.message);
        res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
    }
});

app.listen(port, () => {
  console.log(`サーバーが起動しました。 http://localhost:${port} にアクセスしてください`);
});
