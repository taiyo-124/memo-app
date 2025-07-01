// === DOM要素の取得 ===
// 既存の要素
const memoInput = document.getElementById('memo-input');
const saveButton = document.getElementById('save-button');
const memoList = document.getElementById('memo-list');

const categoryNameInput = document.getElementById('category-name-input');
const categoryColorInput = document.getElementById('category-color-input');
const addCategoryButton = document.getElementById('add-category-button');
const categoryListDisplay = document.getElementById('category-list-display');
const memoCategorySelect = document.getElementById('memo-category-select');

const prevMonthButton = document.getElementById('prev-month-button');
const nextMonthButton = document.getElementById('next-month-button');
const currentMonthYear = document.getElementById('current-month-year');
const calendarGrid = document.getElementById('calendar-grid');
const selectedDateText = document.getElementById('selected-date-text');

// 新しく追加したページ切り替え関連のDOM要素
const showMemoPageButton = document.getElementById('show-memo-page');
const showCategoryPageButton = document.getElementById('show-category-page');
const memoPage = document.getElementById('memo-page');
const categoryManagementPage = document.getElementById('category-management-page');

// === グローバル変数 ===
let categories = [];
const CATEGORY_COLORS = [
    "#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1",
    "#fd7e14", "#20c997", "#6c757d", "#e83e8c", "#17a2b8"
];
let currentColorIndex = 0;

let currentCalendarDate = new Date();
let selectedDate = new Date();

// === 関数定義 ===

// --- ページ切り替え関数 ---
/**
 * 指定されたページを表示し、他のページを非表示にする
 * @param {HTMLElement} pageToShow - 表示するページのDOM要素
 * @param {HTMLElement} buttonToActivate - アクティブにするナビゲーションボタンのDOM要素
 */
function showPage(pageToShow, buttonToActivate) {
    // 全てのページコンテナを非表示にする
    document.querySelectorAll('.page-container').forEach(page => {
        page.classList.remove('active');
    });
    // 全てのナビゲーションボタンからactiveクラスを削除
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
    });

    // 指定されたページを表示する
    pageToShow.classList.add('active');
    // 指定されたボタンをアクティブにする
    buttonToActivate.classList.add('active');

    // ページ切り替え時に必要な再ロード処理
    if (pageToShow === memoPage) {
        // メモページに切り替わったらカレンダーとメモを再描画
        renderCalendar(currentCalendarDate); // 現在の月を再描画
        loadMemos(); // 選択された日付のメモを再表示
    } else if (pageToShow === categoryManagementPage) {
        // カテゴリ管理ページに切り替わったらカテゴリ一覧を再描画
        loadCategories();
    }
}

// --- カレンダー関連関数 ---

/**
 * カレンダーを生成し、表示を更新する関数
 * @param {Date} date - 表示する月を含む日付オブジェクト
 */
function renderCalendar(date) {
    currentCalendarDate = new Date(date); // 現在表示しているカレンダーの日付を更新
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth(); // 0-11 (Jan-Dec)

    // 現在の月と年を表示
    currentMonthYear.textContent = `${year}年 ${month + 1}月`;

    // カレンダーの日付グリッドをクリア
    calendarGrid.innerHTML = '';

    // 月の最初の日と最終の日を取得
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0); // 翌月の0日目は当月の最終日

    // 1日の曜日 (0:日曜, 1:月曜, ...)
    const startDay = firstDayOfMonth.getDay();

    // グリッドに表示する日数 (前月の日付を含む)
    // 6週分表示するために最大42マス
    const totalCells = 42; // 7日 * 6週

    // 前月の日付からカレンダーを埋める
    const prevMonthLastDay = new Date(year, month, 0).getDate(); // 前月の最終日
    for (let i = startDay -1; i >= 0; i--) { // 前月分の日付を埋める
        const day = prevMonthLastDay - i;
        createCalendarDay(day, 'prev-month');
    }

    // 当月の日付を埋める
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const fullDate = new Date(year, month, day);
        let classes = ['current-month'];
        if (fullDate.toDateString() === new Date().toDateString()) {
            classes.push('today'); // 今日の日付
        }
        createCalendarDay(day, classes, fullDate);
    }

    // 翌月の日付で残りのマスを埋める
    const remainingCells = totalCells - calendarGrid.children.length;
    for (let day = 1; day <= remainingCells; day++) {
        createCalendarDay(day, 'next-month');
    }

    // 選択されている日付のスタイルを適用
    updateSelectedDateDisplay();
    highlightSelectedDate();
    updateMemoIndicators(); // メモの有無インジケータを更新
}

/**
 * カレンダーの日付セルを作成し、グリッドに追加するヘルパー関数
 * @param {number} day - 日付の数字
 * @param {string|string[]} classNames - セルに追加するCSSクラス
 * @param {Date} fullDate - そのセルの完全な日付オブジェクト (当月の日付のみ)
 */
function createCalendarDay(day, classNames, fullDate = null) {
    const dayElement = document.createElement('div');
    dayElement.classList.add('calendar-day');
    if (Array.isArray(classNames)) {
        dayElement.classList.add(...classNames);
    } else {
        dayElement.classList.add(classNames);
    }

    // 日付の数字を表示
    const dayNumber = document.createElement('span');
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);

    // 当月の日付のみクリック可能にし、データ属性を設定
    if (fullDate && dayElement.classList.contains('current-month')) {
        dayElement.dataset.date = fullDate.toISOString().split('T')[0]; // YYYY-MM-DD 形式で保存
        dayElement.addEventListener('click', () => selectDate(fullDate));
    }

    calendarGrid.appendChild(dayElement);
}

/**
 * 日付を選択する関数
 * @param {Date} date - 選択された日付オブジェクト
 */
function selectDate(date) {
    selectedDate = new Date(date);
    updateSelectedDateDisplay();
    highlightSelectedDate();
    loadMemos(); // 選択された日付のメモのみを表示
}

/**
 * 選択されている日付の表示を更新する関数
 */
function updateSelectedDateDisplay() {
    selectedDateText.textContent = formatDate(selectedDate);
}

/**
 * カレンダー上で選択されている日付をハイライトする関数
 */
function highlightSelectedDate() {
    document.querySelectorAll('.calendar-day.selected').forEach(cell => {
        cell.classList.remove('selected');
    });

    const selectedDateString = selectedDate.toISOString().split('T')[0];
    const targetCell = document.querySelector(`.calendar-day[data-date="${selectedDateString}"]`);
    if (targetCell) {
        targetCell.classList.add('selected');
    }
}

/**
 * メモがある日付にインジケータを表示する関数
 */
function updateMemoIndicators() {
    const allMemos = JSON.parse(localStorage.getItem('memos')) || [];
    const memosByDate = {}; // 日付ごとのメモの有無を記録
    allMemos.forEach(memo => {
        const memoDate = memo.date; // メモの日付を取得
        if (memoDate) {
            memosByDate[memoDate] = true;
        }
    });

    document.querySelectorAll('.calendar-day.current-month').forEach(cell => {
        const date = cell.dataset.date;
        const existingIndicator = cell.querySelector('.memo-indicator');
        if (memosByDate[date]) {
            if (!existingIndicator) { // インジケータがなければ追加
                const indicator = document.createElement('div');
                indicator.classList.add('memo-indicator');
                cell.appendChild(indicator);
            }
        } else { // メモがなければインジケータを削除
            if (existingIndicator) {
                existingIndicator.remove();
            }
        }
    });
}

/**
 * 日付を YYYY年MM月DD日 の形式にフォーマットするヘルパー関数
 * @param {Date} date - フォーマットする日付オブジェクト
 * @returns {string} フォーマットされた日付文字列
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}

// --- カテゴリ関連関数 (変更なし、または微修正) ---

function loadCategories() {
    categories = JSON.parse(localStorage.getItem('categories')) || [];
    currentColorIndex = categories.length % CATEGORY_COLORS.length;
    displayCategories();
    populateCategorySelect();
}

function displayCategories() {
    categoryListDisplay.innerHTML = '';
    if (categories.length === 0) {
        categoryListDisplay.textContent = 'まだカテゴリがありません。';
        return;
    }
    categories.forEach(category => {
        const categoryTag = document.createElement('span');
        categoryTag.classList.add('category-tag');
        categoryTag.style.backgroundColor = category.color;
        categoryTag.textContent = category.name;
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-category-button');
        deleteButton.textContent = 'x';
        deleteButton.onclick = (event) => {
            event.stopPropagation();
            deleteCategory(category.id);
        };
        categoryTag.appendChild(deleteButton);
        categoryListDisplay.appendChild(categoryTag);
    });
}

function populateCategorySelect() {
    memoCategorySelect.innerHTML = '<option value="">カテゴリを選択しない</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        memoCategorySelect.appendChild(option);
    });
}

function addCategory() {
    const name = categoryNameInput.value.trim();
    if (name) {
        const isDuplicate = categories.some(category => category.name === name);
        if (isDuplicate) {
            alert('そのカテゴリ名は既に存在します。');
            return;
        }
        const colorToAssign = CATEGORY_COLORS[currentColorIndex];
        currentColorIndex = (currentColorIndex + 1) % CATEGORY_COLORS.length;
        const newCategory = {
            id: Date.now(),
            name: name,
            color: colorToAssign
        };
        categories.push(newCategory);
        localStorage.setItem('categories', JSON.stringify(categories));
        categoryNameInput.value = '';
        loadCategories();
    } else {
        alert('カテゴリ名を入力してください。');
    }
}

function deleteCategory(id) {
    if (!confirm('このカテゴリを削除しますか？このカテゴリが設定されているメモは「カテゴリなし」になります。')) {
        return;
    }
    categories = categories.filter(category => category.id !== id);
    localStorage.setItem('categories', JSON.stringify(categories));
    let memos = JSON.parse(localStorage.getItem('memos')) || [];
    memos.forEach(memo => {
        if (memo.categoryId === id) {
            memo.categoryId = '';
        }
    });
    localStorage.setItem('memos', JSON.stringify(memos));
    loadCategories();
    loadMemos();
}


// --- メモ関連関数 (日付対応に修正) ---

/**
 * ローカルストレージからメモを読み込み、表示する関数
 * (選択された日付のメモのみを表示するように修正)
 */
function loadMemos() {
    const allMemos = JSON.parse(localStorage.getItem('memos')) || [];
    memoList.innerHTML = '';

    // 選択された日付のメモのみをフィルタリング
    const selectedDateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const filteredMemos = allMemos.filter(memo => memo.date === selectedDateString);

    // フィルタリングされたメモを逆順にソート（新しいメモが上に来るように）
    const sortedMemos = JSON.parse(JSON.stringify(filteredMemos)).reverse();

    if (sortedMemos.length === 0) {
        memoList.textContent = 'この日付にはメモがありません。';
        return;
    }

    sortedMemos.forEach((memo, index) => {
        const memoItem = document.createElement('div');
        memoItem.classList.add('memo-item');

        const selectedCategory = categories.find(cat => cat.id == memo.categoryId);
        if (selectedCategory) {
            const categoryTag = document.createElement('span');
            categoryTag.classList.add('memo-category-tag');
            categoryTag.style.backgroundColor = selectedCategory.color;
            categoryTag.textContent = selectedCategory.name;
            memoItem.appendChild(categoryTag);
        }

        const memoContent = document.createElement('p');
        memoContent.classList.add('memo-content');
        memoContent.textContent = memo.text;
        memoItem.appendChild(memoContent);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.textContent = '削除';
        deleteButton.onclick = () => {
            deleteMemo(memo.id);
        };
        memoItem.appendChild(deleteButton);

        memoList.appendChild(memoItem);
    });
}

/**
 * 新しいメモを保存する関数
 * (日付情報を追加)
 */
function saveMemo() {
    const memoText = memoInput.value.trim();
    const selectedCategoryId = memoCategorySelect.value;
    const memoDate = selectedDate.toISOString().split('T')[0]; // 選択された日付を YYYY-MM-DD 形式で取得

    if (memoText) {
        const memos = JSON.parse(localStorage.getItem('memos')) || [];

        const newMemo = {
            id: Date.now(),
            text: memoText,
            categoryId: selectedCategoryId,
            date: memoDate // 日付情報を追加
        };

        memos.push(newMemo);
        localStorage.setItem('memos', JSON.stringify(memos));

        memoInput.value = '';
        memoCategorySelect.value = '';
        loadMemos(); // 選択された日付のメモを再表示
        updateMemoIndicators(); // カレンダーのメモインジケータも更新
    } else {
        alert('メモが空です。何か入力してください。');
    }
}

/**
 * 指定されたIDのメモを削除する関数
 * (変更なし、ただし呼び出し元でupdateMemoIndicatorsを呼び出す必要あり)
 */
function deleteMemo(id) {
    let memos = JSON.parse(localStorage.getItem('memos')) || [];
    memos = memos.filter(memo => memo.id !== id);
    localStorage.setItem('memos', JSON.stringify(memos));
    loadMemos();
    updateMemoIndicators(); // メモ削除後もインジケータを更新
}

// === イベントリスナーの設定 ===
saveButton.addEventListener('click', saveMemo);
addCategoryButton.addEventListener('click', addCategory);

prevMonthButton.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar(currentCalendarDate);
});
nextMonthButton.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar(currentCalendarDate);
});

// ページ切り替えボタンのイベントリスナーを追加
showMemoPageButton.addEventListener('click', () => showPage(memoPage, showMemoPageButton));
showCategoryPageButton.addEventListener('click', () => showPage(categoryManagementPage, showCategoryPageButton));


// === 初期ロード ===
document.addEventListener('DOMContentLoaded', () => {
    // ページロード時にメモページをデフォルトで表示
    showPage(memoPage, showMemoPageButton);

    // カレンダーとメモの初期ロード（showPageで呼び出されるのでここでは不要だが、念のため）
    // renderCalendar(new Date()); // showPage('memo-page')内で呼ばれる
    // selectDate(new Date());     // showPage('memo-page')内で呼ばれる
});