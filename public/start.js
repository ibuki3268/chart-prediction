// "工事中"ボタンがクリックされたときの処理
document.querySelectorAll('.disabled').forEach(button => {
    button.addEventListener('click', (event) => {
        event.preventDefault(); // ページ遷移を無効化
        alert('この機能は現在準備中です。');
    });
});

// 銘柄一覧ポップアップの処理
const modal = document.getElementById('ticker-modal');
const openBtn = document.getElementById('list-button');
const closeBtn = document.querySelector('.close-button');

// 「銘柄コード一覧」ボタンがクリックされたらポップアップを表示
openBtn.onclick = function() {
    modal.style.display = "flex";
}

// 閉じるボタン(x)がクリックされたらポップアップを非表示
closeBtn.onclick = function() {
    modal.style.display = "none";
}

// ポップアップの外側がクリックされたらポップアップを非表示
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
