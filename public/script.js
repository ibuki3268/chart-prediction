// グローバルスコープにchart変数を定義
let stockChart;

// ボタンがクリックされたらグラフを更新する関数
async function updateChart() {
    const symbolInput = document.getElementById('symbol-input');
    const symbol = symbolInput.value.toUpperCase(); // 大文字に統一
    const loadingText = document.getElementById('loading-text');

    if (!symbol) {
        alert('銘柄コードを入力してください。');
        return;
    }

    loadingText.style.display = 'block'; // 「読み込み中...」を表示

    try {
        // Step 1: バックエンドに選択された銘柄コードでデータをリクエスト
        const response = await fetch(`/api/stockdata?symbol=${symbol}`);
        if (!response.ok) {
            throw new Error(`サーバーとの通信に失敗しました: ${response.statusText}`);
        }
        const data = await response.json();

        if (!data['Time Series (Daily)']) {
            if (data['Note']) {
                alert(`APIの利用制限に達したようです。\nしばらく待ってから、再度試してください。`);
            } else {
                alert(`「${symbol}」のデータ取得に失敗しました。銘柄コードが正しいか確認してください。`);
            }
            return;
        }

        // Step 2: データを加工
        const timeSeries = data['Time Series (Daily)'];
        const labels = Object.keys(timeSeries).reverse();
        const prices = labels.map(date => timeSeries[date]['4. close']);

        // Step 3: グラフを描画または更新
        const ctx = document.getElementById('stockChart').getContext('2d');

        // もし既にチャートが存在していたら、それを破棄する
        if (stockChart) {
            stockChart.destroy();
        }

        // 新しいチャートを描画
        stockChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${symbol} 株価 (終値)`,
                    data: prices,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `${symbol} の過去100日間の株価推移`
                    }
                }
            }
        });

    } catch (error) {
        console.error('チャートの更新中にエラーが発生しました:', error);
        alert('チャートの更新に失敗しました。詳細はコンソールを確認してください。');
    } finally {
        loadingText.style.display = 'none'; // 「読み込み中...」を非表示
    }
}

// ページの読み込みが完了したらイベントリスナーをセット
document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', updateChart);

    // 初期表示としてIBMのチャートを表示
    document.getElementById('symbol-input').value = 'IBM';
    updateChart();
});
