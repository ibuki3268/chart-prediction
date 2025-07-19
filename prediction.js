const ss = require('simple-statistics');

function calculatePrediction(timeSeries){
    //データ整形
    const formattedData = Object.entries(timeSeries)
     .map(([date, values]) => ({
            date: date,
            price: parseFloat(values['4. close'])
        }))
    .reverse();//日付の並べ替え

    //以下予測計算
    const regressionData = formattedData.map((d,index)=>[index,d.price]);

    //線形回帰モデル計算
    const { m, b }=ss.linearRegression(regressionData);
    const regressionLine = ss.linearRegressionLine({ m, b });

    //未来30日間の価格を予測 
    const lastIndex = formattedData.length - 1;
    const predictionData = {
        labels: [],
        prices: []
    };

    for (let i = 1; i <= 30; i++){
        const futureIndex = lastIndex + i;
        const predictedPrice = regressionLine(futureIndex);

        //日付の計算
        const lastDate =new Date(formattedData[lastIndex].date);
        const futureDate =new Date(lastDate);
        futureDate.setDate(lastDate.getDate() + i); 

        predictionData.labels.push(futureDate.toISOString().split('T')[0]);
        predictionData.prices.push(predictedPrice);
    }

    // 予測データを返す
    const historicalData = {
        labels: formattedData.map(d => d.date),
        prices: formattedData.map(d => d.price)
    };

    return{
        historical:historicalData,
        prediction:predictionData
    };
}

module.exports ={
    calculatePrediction
};