const express = require('express');
const axios = require('axios');
const { calculatePrediction} = require('./prediction.js');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

//データ予測返す
app.get('/api/predict', async (req, res) => {
    const symbol = req.query.symbol || 'IBM';

    if (!symbol) {
        return res.status(400).json({ error: '銘柄コードが指定されていません' });
    }

    try {
        const apiKey = '6GPBO86PLOFY3HU8'; 
        const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`);

        const data = response.data;
        if (!data['Time Series (Daily)']){
          let errorMessage = `銘柄コード「${symbol}」のデータが見つかりません。`;
            if (data['Note']) {
                errorMessage = 'APIの利用制限に達したようです。\nしばらく待ってから、再度お試しください。';
            }
            return res.status(404).json({ error: errorMessage });
        }

        //予測関数呼び出し　取得
        const timeSeries = data['Time Series (Daily)'];
        const result = calculatePrediction(timeSeries);
        //計算結果返す
        res.json(result);

    } catch (error) {
        console.error('API:レート制限が来ました', error.message);
        res.status(500).json({ error: 'errorサーバー内部でエラー' });
    }
});

app.listen(port, () => {
  console.log(` http://localhost:${port} にアクセスしてください`);
});

