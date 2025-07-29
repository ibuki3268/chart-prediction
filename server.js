const express = require('express');
const axios = require('axios');
const path = require('path');
const { calculatePrediction, calculateMovingAveragePrediction } = require('./prediction.js');

const app = express();
const port = 3000;
require('dotenv').config();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'start.html'));
});

app.use(express.static('public'));

app.get('/chart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chart.html'));
});

app.get('/ma_chart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ma_chart.html'));
});

// 共通のAPIデータ取得関数
async function getStockData(symbol) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    
    // ★★★ デバッグ用: APIキーが読み込めているか確認 ★★★
    console.log("Using API Key:", apiKey ? "Key found" : "KEY NOT FOUND!");

    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&outputsize=full&symbol=${symbol}&apikey=${apiKey}`;
    const response = await axios.get(url);
    const data = response.data;
    
    // ★★★ デバッグ用: Alpha Vantageからの応答をそのまま表示 ★★★
    console.log("Response from Alpha Vantage:");
    console.log(data);
    
    if (!data['Time Series (Daily)']) {
        // エラーメッセージをより具体的に
        const errorMessage = data['Error Message'] || data['Note'] || 'データが見つかりませんでした。';
        throw new Error(errorMessage);
    }
    return data['Time Series (Daily)'];
}


// 線形回帰用API
app.get('/api/predict', async (req, res) => {
    try {
        const symbol = req.query.symbol || 'IBM';
        const timeSeries = await getStockData(symbol);
        const result = calculatePrediction(timeSeries);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// 移動平均用API
app.get('/api/predict_ma', async (req, res) => {
    try {
        const symbol = req.query.symbol || 'IBM';
        const timeSeries = await getStockData(symbol);
        const result = calculateMovingAveragePrediction(timeSeries);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.listen(port, () => {
  console.log(`サーバーが起動しました。 http://localhost:${port} にアクセスしてください`);
});
