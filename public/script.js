let stockChart;

// ボタンがクリックされたらグラフを更新する関数
async function updateChart() {
    const symbolInput = document.getElementById('symbol-input');
    const symbol = symbolInput.value.trim().toUpperCase(); // 大文字に統一
    const loadingText = document.getElementById('loading-text');

    if (!symbol) {
        alert('銘柄コードを入力してください。');
        return;
    }

    loadingText.style.display = 'block'; // 「読み込み中...」を表示

    try {
        // Step 1: バックエンドに選択された銘柄コードでデータをリクエスト
        const response = await fetch(`/api/predict?symbol=${symbol}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `サーバーとの通信に失敗しました: ${response.statusText}`);
        }


        const data = await response.json();
        const historical = data.historical;
        const prediction = data.prediction;

        const allLabels = [...historical.labels, ...prediction.labels];
        
        // 実績データの後ろに、予測データと同じ数の空データを追加
        const historicalPricesPadded = [...historical.prices, ...new Array(prediction.prices.length).fill(null)];
        
        // 予測データが実績データの終点から始まるように、空データを追加
        const lastHistoricalPrice = historical.prices[historical.prices.length - 1];
        const predictionPricesPadded = [...new Array(historical.prices.length - 1).fill(null), lastHistoricalPrice, ...prediction.prices];

         // グラフを描画または更新
        const ctx = document.getElementById('stockChart').getContext('2d');

        if (stockChart) {
            stockChart.destroy();
        }

        // 新しいチャートを描画
        stockChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: allLabels,
                datasets: [{
                    label: `${symbol} 株価 (終値)`,
                    data: historicalPricesPadded,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                },
                {
                        label: `${symbol} 予測 (線形回帰)`,
                        data: predictionPricesPadded, // 予測データ
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderDash: [5, 5], // 予測線を破線にする
                        tension: 0.1
                    }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `${symbol}の株価実績と予測`
                    },
                    tooltip:{
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales:{
                    x:{ display: true, title: { display: true, text: '日付' }},
                    y:{ display: true, title: { display: true, text: '株価 (USD)' }}
                }
            }
        });

    } catch (error) {
        console.error('チャートの更新中にエラーが発生しました:', error);
        alert(error.message);
    } finally {
        loadingText.style.display = 'none'; // 「読み込み中...」を非表示
    }
}

// ページの読み込みが完了したらイベントリスナーをセット
document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', updateChart);

     const symbolInput = document.getElementById('symbol-input');
     symbolInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            updateChart();
        }
    });
    document.getElementById('symbol-input').value = 'GOOGL';
    updateChart();
});
