    let stockChart;

    async function updateChart() {
        const symbolInput = document.getElementById('symbol-input');
        const symbol = symbolInput.value.trim().toUpperCase();
        const loadingText = document.getElementById('loading-text');

        if (!symbol) {
            alert('銘柄コードを入力してください。');
            return;
        }

        loadingText.style.display = 'block';

        try {
            // 移動平均用の新しいAPIエンドポイントを呼び出します
            const response = await fetch(`/api/predict_ma?symbol=${symbol}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `サーバーエラー: ${response.status}`);
            }

            const data = await response.json();
            const historical = data.historical;
            const prediction = data.prediction;

            const allLabels = [...historical.labels, ...prediction.labels];
            const historicalPricesPadded = [...historical.prices, ...new Array(prediction.prices.length).fill(null)];
            const lastHistoricalPrice = historical.prices[historical.prices.length - 1];
            const predictionPricesPadded = [...new Array(historical.prices.length - 1).fill(null), lastHistoricalPrice, ...prediction.prices];

            const ctx = document.getElementById('stockChart').getContext('2d');

            if (stockChart) {
                stockChart.destroy();
            }

            stockChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: allLabels,
                    datasets: [
                        {
                            label: `${symbol} 実績 (終値)`,
                            data: historicalPricesPadded,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.1
                        },
                        {
                            label: `${symbol} 予測 (25日移動平均)`,
                            data: predictionPricesPadded,
                            borderColor: 'rgba(255, 159, 64, 1)',
                            borderDash: [5, 5],
                            tension: 0.1,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: { display: true, text: `${symbol} の株価実績と移動平均による予測` },
                        tooltip: { mode: 'index', intersect: false }
                    },
                    scales: {
                        x: { display: true, title: { display: true, text: '日付' } },
                        y: { display: true, title: { display: true, text: '株価 (USD)' } }
                    }
                }
            });

        } catch (error) {
            console.error('チャートの更新中にエラーが発生しました:', error);
            alert(error.message);
        } finally {
            loadingText.style.display = 'none';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('search-button').addEventListener('click', updateChart);
        document.getElementById('symbol-input').addEventListener('keyup', (event) => {
            if (event.key === 'Enter') updateChart();
        });
        document.getElementById('symbol-input').value = 'GOOGL';
        updateChart();
    });
    