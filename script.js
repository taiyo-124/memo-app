// === DOM要素の取得 ===
// メモ入力用のテキストエリア要素
const memoInput = document.getElementById('memo-input');
// メモ保存ボタン要素
const saveButton = document.getElementById('save-button');
// メモを表示するリストの親要素
const memoList = document.getElementById('memo-list');

// === 関数定義 ===

/**
 * ローカルストレージからメモを読み込み、表示する関数
 */
function loadMemos() {
    // ローカルストレージから 'memos' というキーで保存されたJSON文字列を取得
    // もしデータがなければ空の配列をデフォルトとする
    const memos = JSON.parse(localStorage.getItem('memos')) || [];

    // 既存のメモリストをクリア
    memoList.innerHTML = '';

    // 取得したメモ配列を逆順にソート（新しいメモが上に来るように）
    // オブジェクトのディープコピーのためJSON.parse(JSON.stringify(memo))を使用
    const sortedMemos = JSON.parse(JSON.stringify(memos)).reverse();

    // 各メモをHTML要素として作成し、リストに追加
    sortedMemos.forEach((memo, index) => {
        // メモアイテム全体を囲むdiv要素を作成
        const memoItem = document.createElement('div');
        memoItem.classList.add('memo-item'); // CSSクラスを追加

        // メモの内容を表示するp要素を作成
        const memoContent = document.createElement('p');
        memoContent.classList.add('memo-content'); // CSSクラスを追加
        memoContent.textContent = memo.text; // メモのテキストを設定

        // 削除ボタンを作成
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button'); // CSSクラスを追加
        deleteButton.textContent = '削除';

        // 削除ボタンがクリックされた時の処理を設定
        deleteButton.onclick = () => {
            deleteMemo(memo.id); // このメモのIDを使って削除関数を呼び出す
        };

        // memoItemにメモ内容と削除ボタンを追加
        memoItem.appendChild(memoContent);
        memoItem.appendChild(deleteButton);

        // memoListに完成したメモアイテムを追加
        memoList.appendChild(memoItem);
    });
}

/**
 * 新しいメモを保存する関数
 */
function saveMemo() {
    // テキストエリアからメモのテキストを取得し、前後の空白を除去
    const memoText = memoInput.value.trim();

    // メモが空でなければ処理を続行
    if (memoText) {
        // ローカルストレージから既存のメモを取得
        const memos = JSON.parse(localStorage.getItem('memos')) || [];

        // 新しいメモオブジェクトを作成
        // ユニークなID（現在時刻のタイムスタンプ）とテキストを持つ
        const newMemo = {
            id: Date.now(), // 現在のタイムスタンプをIDとして使用
            text: memoText
        };

        // 新しいメモを配列に追加
        memos.push(newMemo);

        // 更新されたメモ配列をJSON文字列に変換してローカルストレージに保存
        localStorage.setItem('memos', JSON.stringify(memos));

        // テキストエリアをクリア
        memoInput.value = '';

        // メモリストを再読み込みして最新の状態を表示
        loadMemos();
    } else {
        alert('メモが空です。何か入力してください。'); // 空のメモに対する警告
    }
}
/**
 * 指定されたIDのメモを削除する関数
 * @param {number} id - 削除するメモのID
 */
function deleteMemo(id) {
    // ローカルストレージから既存のメモを取得
    let memos = JSON.parse(localStorage.getItem('memos')) || [];

    // 削除対象のメモを除外した新しい配列を作成
    memos = memos.filter(memo => memo.id !== id);

    // 更新されたメモ配列をローカルストレージに保存
    localStorage.setItem('memos', JSON.stringify(memos));

    // メモリストを再読み込みして最新の状態を表示
    loadMemos();
}

// === イベントリスナーの設定 ===

// 保存ボタンがクリックされたらsaveMemo関数を実行
saveButton.addEventListener('click', saveMemo);

// === 初期ロード ===
// ページがロードされた時にメモを読み込み、表示する
document.addEventListener('DOMContentLoaded', loadMemos);