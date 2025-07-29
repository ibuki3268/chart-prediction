const ss = require('simple-statistics');

// 共通のデータ整形関数
function formatData(timeSeries) {
    return Object.entries(timeSeries).map(([date, values]) => ({
        date: date,
        price: parseFloat(values['4. close']) // or '5. adjusted close' if using ADJUSTED endpoint
    })).reverse();
}

// 1. 線形回帰の予測（修正済み）
function calculatePrediction(timeSeries) {
    const allData = formatData(timeSeries);

    // ★★★ 修正点 ★★★
    // 先にデータを直近500件に絞り込む
    const recentData = allData.slice(-500);

    // 絞り込んだデータを使って、線形回帰モデルを学習させる
    const regressionData = recentData.map((d, index) => [index, d.price]);
    const { m, b } = ss.linearRegression(regressionData);
    const regressionLine = ss.linearRegressionLine({ m, b });

    const lastIndex = recentData.length - 1;
    const predictionData = { labels: [], prices: [] };

    for (let i = 1; i <= 30; i++) {
        predictionData.prices.push(regressionLine(lastIndex + i));
        const futureDate = new Date(recentData[lastIndex].date);
        futureDate.setDate(futureDate.getDate() + i);
        predictionData.labels.push(futureDate.toISOString().split('T')[0]);
    }

    return {
        historical: { labels: recentData.map(d => d.date), prices: recentData.map(d => d.price) },
        prediction: predictionData
    };
}

// 2. 移動平均の予測（こちらも直近500件に絞るよう修正）
function calculateMovingAveragePrediction(timeSeries) {
    const allData = formatData(timeSeries);
    const recentData = allData.slice(-500); // データを直近500件に絞る

    const prices = recentData.map(d => d.price);
    const windowSize = 25;

    const predictionData = { labels: [], prices: [] };
    const lastIndex = recentData.length - 1;

    if (prices.length < windowSize) {
        for (let i = 1; i <= 30; i++) predictionData.prices.push(prices[lastIndex]);
    } else {
        const returns = [];
        const lastWindow = prices.slice(-windowSize);
        for (let i = 1; i < lastWindow.length; i++) {
            returns.push(lastWindow[i] / lastWindow[i - 1] - 1);
        }
        const drift = ss.mean(returns);
        const volatility = ss.standardDeviation(returns);
        let lastPrice = prices[lastIndex];
        for (let i = 0; i < 30; i++) {
            const randomShock = (Math.random() - 0.5) * 2 + (Math.random() - 0.5) * 2;
            const predictedReturn = drift + volatility * randomShock;
            const nextPrice = lastPrice * (1 + predictedReturn);
            predictionData.prices.push(nextPrice);
            lastPrice = nextPrice;
        }
    }
    
    for (let i = 1; i <= 30; i++) {
        const futureDate = new Date(recentData[lastIndex].date);
        futureDate.setDate(futureDate.getDate() + i);
        predictionData.labels.push(futureDate.toISOString().split('T')[0]);
    }

    return {
        historical: { labels: recentData.map(d => d.date), prices: recentData.map(d => d.price) },
        prediction: predictionData
    };
}

module.exports = {
    calculatePrediction,
    calculateMovingAveragePrediction
};