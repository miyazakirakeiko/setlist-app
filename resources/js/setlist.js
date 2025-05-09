console.log('--- setlist.js (Vite) ロード開始 ---');

// --- グローバル変数 ---
let currentSetlistItems = []; // セットリスト項目
let invertColors = false;     // 白黒反転の状態フラグ
const csrfToken = window.csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'); // CSRFトークン
const findOrCreateSongUrl = window.findOrCreateSongUrl || '/songs/find-or-create'; // Ajax URL
const SESSION_STORAGE_KEY = 'draftSetlistData'; // Session Storage 用のキー

// --- DOM要素参照 (DOMContentLoaded内で取得) ---
let songInput, setlistDisplay, dataList, addButton, mcButton;
let previewButton, pdfButton, invertButton, previewArea, previewContent;
let bandNameInput, eventNameInput, dateInput, venueNameInput;
let clearDraftButton; // ★ 「入力値をクリア」ボタンの変数を追加

// ==================================================================
// --- 初期化処理 (ページ読み込み完了時に実行) ---
// ==================================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM コンテンツ読み込み完了');

    // --- DOM要素を取得 ---
    initializeDOMReferences();

    // --- 必須要素の存在チェック ---
    if (!validateRequiredElements()) {
        return; // 必須要素がなければ処理中断
    }

    // --- Session Storage からデータを読み込み ---
    loadSetlistFromSession();

    // --- イベントリスナーを設定 ---
    setupEventListeners();

    // --- SortableJSを初期化 ---
    initializeSortable();

    // --- 初期セットリスト表示 ---
    renderSetlist();

    // --- ログアウト処理のフック ---
    setupLogoutHandler();

    console.log('初期化完了');
});

/**
 * DOM要素への参照をグローバル変数に格納する
 */
function initializeDOMReferences() {
    songInput = document.getElementById('song-input');
    setlistDisplay = document.getElementById('setlist'); // ul 要素
    dataList = document.getElementById('song-suggestions');
    addButton = document.getElementById('add-song-button');
    mcButton = document.getElementById('add-mc-button');
    previewButton = document.getElementById('show-preview-button');
    pdfButton = document.getElementById('generate-pdf-button');
    invertButton = document.getElementById('toggle-invert-button');
    previewArea = document.getElementById('preview-area');
    previewContent = document.getElementById('preview-content');
    bandNameInput = document.getElementById('band-name');
    eventNameInput = document.getElementById('event-name');
    dateInput = document.getElementById('date-input');
    venueNameInput = document.getElementById('venue-name');
    clearDraftButton = document.getElementById('clear-draft-button'); // ★ ボタン要素を取得
}

/**
 * 必須のDOM要素が存在するか検証する
 * @returns {boolean} 必須要素がすべて存在すれば true
 */
function validateRequiredElements() {
    if (!songInput || !setlistDisplay || !dataList || !addButton || !mcButton) {
        console.error('必須のHTML要素 (song-input, setlist, song-suggestions, add-song-button, add-mc-button) が見つかりません。IDを確認してください。');
        return false;
    }
    if (!bandNameInput || !eventNameInput || !dateInput || !venueNameInput) {
        console.warn('メタデータ入力要素 (band-name, event-name, date-input, venue-name) の一部が見つかりません。');
    }
    // clearDraftButton はオプションなので、ここでは必須チェックに含めない
    return true;
}

/**
 * Session Storage からセットリストデータとメタデータを読み込む
 */
function loadSetlistFromSession() {
    const savedJson = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (savedJson) {
        try {
            const savedData = JSON.parse(savedJson);
            if (typeof savedData === 'object' && savedData !== null && 'items' in savedData && 'metadata' in savedData) {
                currentSetlistItems = Array.isArray(savedData.items) ? savedData.items : [];
                if (savedData.metadata) {
                    if (bandNameInput && typeof savedData.metadata.bandName === 'string') bandNameInput.value = savedData.metadata.bandName;
                    if (eventNameInput && typeof savedData.metadata.eventName === 'string') eventNameInput.value = savedData.metadata.eventName;
                    if (dateInput && typeof savedData.metadata.date === 'string') dateInput.value = savedData.metadata.date;
                    if (venueNameInput && typeof savedData.metadata.venueName === 'string') venueNameInput.value = savedData.metadata.venueName;
                }
                console.log('SessionStorage からセットリストとメタデータを復元しました:', savedData);
            } else if (Array.isArray(savedData)) {
                currentSetlistItems = savedData;
                console.log('SessionStorage からセットリスト (古い形式) を復元しました:', currentSetlistItems);
            } else {
                console.warn('SessionStorage のデータ形式が不正です。リセットします。', savedData);
                currentSetlistItems = [];
            }
        } catch (e) {
            console.error('SessionStorage からのデータ復元に失敗しました:', e);
            currentSetlistItems = [];
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    } else {
        currentSetlistItems = [];
    }
}

/**
 * 各ボタンや入力欄にイベントリスナーを設定する
 */
function setupEventListeners() {
    const metadataInputs = [bandNameInput, eventNameInput, venueNameInput];
    metadataInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', saveSetlistToSession);
        }
    });

    if (dateInput) {
        dateInput.addEventListener("change", () => {
            dateInput.blur();
            saveSetlistToSession();
        });
    }

    if (addButton) addButton.addEventListener('click', addSong);
    else console.error('ID "add-song-button" の要素が見つかりません。');

    if (mcButton) mcButton.addEventListener('click', addMC);
    else console.error('ID "add-mc-button" の要素が見つかりません。');

    if (previewButton) previewButton.addEventListener('click', showPreview);
    else console.error('ID "show-preview-button" の要素が見つかりません。');

    if (pdfButton) pdfButton.addEventListener('click', generatePDF);
    else console.error('ID "generate-pdf-button" の要素が見つかりません。');

    if (invertButton) invertButton.addEventListener('click', toggleInvert);
    else console.error('ID "toggle-invert-button" の要素が見つかりません。');

    // ★ 「入力値をクリア」ボタンのイベントリスナーを追加
    if (clearDraftButton) {
        clearDraftButton.addEventListener('click', clearAllDraftData);
    } else {
        console.warn('ID "clear-draft-button" の要素が見つかりません。'); // ボタンがない場合は警告
    }
}

/**
 * SortableJSライブラリを使ってリストの並び替え機能を有効にする
 */
function initializeSortable() {
    if (!setlistDisplay) {
         console.error('ID "setlist" の要素が見つかりません。SortableJSを初期化できません。');
         return;
    }
    if (typeof Sortable === 'undefined') {
        console.error('SortableJSが読み込まれていません。');
        return;
    }

    new Sortable(setlistDisplay, {
        animation: 150,
        ghostClass: 'bg-blue-100',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: function (evt) {
            if (evt.oldIndex !== undefined && evt.newIndex !== undefined && evt.oldIndex !== evt.newIndex) {
                 const movedItem = currentSetlistItems.splice(evt.oldIndex, 1)[0];
                 currentSetlistItems.splice(evt.newIndex, 0, movedItem);
                 renderSetlist();
                 console.log(`項目を ${evt.oldIndex} から ${evt.newIndex} に移動しました。`);
                 saveSetlistToSession();
            }
        },
    });
    console.log('SortableJS 初期化完了');
}

// ==================================================================
// --- ログアウト処理のフック ---
// ==================================================================
function setupLogoutHandler() {
    const logoutForms = [
        document.getElementById('logout-form'),
        document.getElementById('logout-form-responsive')
    ].filter(form => form !== null);

    if (logoutForms.length > 0) {
        logoutForms.forEach(form => {
            form.addEventListener('submit', () => {
                console.log(`ログアウトフォーム (${form.id || 'IDなし'}) 送信を検知。Session Storageをクリアします。キー:`, SESSION_STORAGE_KEY);
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            });
        });
        console.log('ログアウト時のSession Storageクリアハンドラを設定しました。対象フォーム数:', logoutForms.length);
    } else {
        console.warn('ログアウトフォームが見つかりませんでした (ID: logout-form, logout-form-responsive)。ログアウト時のSession Storageクリア機能は動作しない可能性があります。');
    }
}


// ==================================================================
// --- セットリスト操作関数 ---
// (addSong, addMC, deleteItem は変更なし)
// ==================================================================
async function addSong() {
    if (!songInput) return;
    const songTitle = songInput.value.trim();
    if (songTitle === "") {
        alert("曲名を入力してください。");
        return;
    }
    const alreadyInSetlist = currentSetlistItems.some(item =>
        item.type === 'song' && item.title.toLowerCase() === songTitle.toLowerCase()
    );
    if (alreadyInSetlist) {
        alert('この曲は既にセットリストに追加されています。');
        songInput.focus();
        return;
    }
    if (addButton) {
        addButton.disabled = true;
        addButton.textContent = '処理中...';
    }
    console.log(`曲名 "${songTitle}"。DBへの登録/確認を試みます... URL: ${findOrCreateSongUrl}`);
    try {
        const response = await fetch(findOrCreateSongUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ title: songTitle })
        });
        const result = await response.json();
        if (!response.ok) {
            console.error(`POST ${response.url} ${response.status} (${response.statusText})`);
            throw new Error(result.message || `サーバーエラー (${response.status})`);
        }
        if (result.success && result.song) {
            console.log('DBへの登録/取得 完了:', result.song);
            currentSetlistItems.push({
                type: 'song',
                id: result.song.id,
                title: result.song.title
            });
            renderSetlist();
            songInput.value = '';
            updateDatalistOption(result.song.title);
            console.log(`"${result.song.title}" をセットリストに追加しました。`);
            saveSetlistToSession();
        } else {
             console.warn('サーバーからの予期しないレスポンス:', result);
             throw new Error(result.message || '曲の処理に失敗しました。');
        }
    } catch (error) {
        console.error('曲のDB登録/確認中にエラーが発生しました:', error);
        alert(`曲の処理中にエラーが発生しました。\n${error.message}\nセットリストへの追加を中止します。`);
    } finally {
        if (addButton) {
            addButton.disabled = false;
            addButton.textContent = '曲を追加';
        }
    }
}

function addMC() {
    if (currentSetlistItems.length >= 20) {
        alert("セットリストに追加できる項目数の上限に達しました。");
        return;
    }
    currentSetlistItems.push({ type: "mc", title: "MC" });
    renderSetlist();
    console.log('"MC" をセットリストに追加しました。');
    saveSetlistToSession();
}

function deleteItem(index) {
    if (index >= 0 && index < currentSetlistItems.length) {
        const itemTitle = currentSetlistItems[index].title;
        currentSetlistItems.splice(index, 1);
        renderSetlist();
        console.log(`項目 "${itemTitle}" (インデックス ${index}) を削除しました。`);
        saveSetlistToSession();
    }
}

// ==================================================================
// --- UI更新 / 表示系関数 ---
// (renderSetlist, updateDatalistOption は変更なし)
// ==================================================================
function renderSetlist() {
    if (!setlistDisplay) { return; }
    setlistDisplay.innerHTML = '';
    let songCounter = 1;
    if (currentSetlistItems.length === 0) {
        const li = document.createElement('li');
        li.classList.add('text-gray-500', 'text-center', 'py-4', 'italic');
        li.textContent = 'セットリストは空です。';
        setlistDisplay.appendChild(li);
        return;
    }
    currentSetlistItems.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = `flex items-center justify-between border border-gray-300 rounded-md p-2 my-1 transition duration-150 ease-in-out hover:shadow-md cursor-grab group ${
            invertColors ? "bg-gray-800 text-white" : "bg-white text-black"
        }`;
        li.dataset.index = index;
        li.dataset.id = item.type === 'song' ? item.id : `mc-${index}`;
        const contentSpan = document.createElement("span");
        contentSpan.className = "flex-grow mr-2 truncate";
        if (item.type === "song") {
            contentSpan.textContent = `${songCounter++}. ${item.title}`;
        } else {
            contentSpan.textContent = item.title;
        }
        li.appendChild(contentSpan);
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "削除";
        deleteButton.className = `flex-shrink-0 px-2 py-1 text-xs text-red-600 hover:text-red-800 ${invertColors ? 'hover:bg-gray-600' : 'hover:bg-red-100'} rounded focus:outline-none focus:ring-1 focus:ring-red-500 transition-opacity`;
        deleteButton.addEventListener('click', (event) => {
             event.stopPropagation();
             deleteItem(index);
        });
        li.appendChild(deleteButton);
        setlistDisplay.appendChild(li);
    });
}

function updateDatalistOption(title) {
    if (!dataList || !dataList.options) { return; }
    let exists = false;
    for (let i = 0; i < dataList.options.length; i++) {
        if (dataList.options[i].value === title) {
            exists = true;
            break;
        }
    }
    if (!exists) {
        const newOption = document.createElement('option');
        newOption.value = title;
        dataList.appendChild(newOption);
        console.log(`Datalist に "${title}" を追加しました。`);
    }
}

// ==================================================================
// --- プレビュー・PDF・反転機能 ---
// (getFontSizeForPDF, showPreview, generatePDF, toggleInvert は変更なし)
// ==================================================================
function getFontSizeForPDF(totalItems) {
    if (totalItems > 16) return "20px";
    if (totalItems > 12) return "25px";
    if (totalItems > 8) return "30px";
    if (totalItems > 4) return "40px";
    return "40px";
}

function showPreview() {
    console.log('プレビュー表示ボタンクリック');
    if (!previewArea || !previewContent) {
        console.error('プレビュー要素が見つかりません。');
        return;
    }
    const bandName = bandNameInput?.value.trim() || "バンド名未入力";
    const eventName = eventNameInput?.value.trim() || "イベント名未入力";
    const inputDate = dateInput?.value.trim() || "日付未入力";
    const venueName = venueNameInput?.value.trim() || "会場名未入力";
    let bandNameFontSize = "24px";
    if (bandName.length >= 16) bandNameFontSize = "17.5px";
    else if (bandName.length >= 11) bandNameFontSize = "20px";
    let songNumber = 1;
    const listItemsHtml = currentSetlistItems.map(item => {
        const style = `font-size: 15px; text-align: left; white-space: normal; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; color: ${invertColors ? "yellow" : "black"};`;
        if (item.type === "song") {
            return `<li style="${style}">${songNumber++}. ${item.title}</li>`;
        } else {
            return `<li style="${style}">${item.title}</li>`;
        }
    }).join("");
    const previewContentHtml = `
        <div style="width: 105mm; height: 149mm; padding: 15px; box-sizing: border-box; background-color: ${invertColors ? 'black' : 'white'}; color: ${invertColors ? 'yellow' : 'black'}; border: 1px solid #ccc; display: flex; flex-direction: column; justify-content: flex-start; align-items: center;">
            <h3 style="font-size: ${bandNameFontSize}; text-align: center; margin: 0 0 5px 0; font-weight: bold;">${bandName}</h3>
            <p style="font-size: 9px; text-align: center; margin: 0 0 5px 0;">${inputDate}</p>
            <p style="font-size: 9px; text-align: center; margin: 0 0 5px 0;">${venueName}</p>
            <p style="font-size: 9px; text-align: center; margin: 0 0 10px 0;">${eventName}</p>
            <ul style="list-style-type: none; padding: 0; margin: 0; width: 100%; text-align: left;">
                ${listItemsHtml}
            </ul>
        </div>`;
    previewContent.innerHTML = previewContentHtml;
    previewArea.style.display = "block";
}

function generatePDF() {
    console.log('PDF出力ボタンクリック');
    if (typeof html2pdf === 'undefined') {
        console.error('html2pdf.jsが読み込まれていません。');
        alert('PDF生成機能を利用できません。');
        return;
    }
    const bandName = bandNameInput?.value.trim() || "バンド名未入力";
    const eventName = eventNameInput?.value.trim() || "イベント名未入力";
    const inputDate = dateInput?.value.trim() || "日付未入力";
    const venueName = venueNameInput?.value.trim() || "会場名未入力";
    let bandNameFontSize;
    if (bandName.length >= 16) bandNameFontSize = "35px";
    else if (bandName.length >= 11) bandNameFontSize = "40px";
    else bandNameFontSize = "48px";
    const totalItems = currentSetlistItems.length;
    const fontSize = getFontSizeForPDF(totalItems);
    let songNumber = 1;
    const pdfListItemsHtml = currentSetlistItems.map(item => {
        const style = `font-size: ${fontSize}; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 8px; line-height: 1.2;`;
         if (item.type === "song") {
             return `<li style="${style}">${songNumber++}. ${item.title}</li>`;
         } else {
             return `<li style="${style} white-space: normal;">${item.title}</li>`;
         }
    }).join("");
    const pdfContentHtml = `
        <div style="width: 100%; padding: 20mm; box-sizing: border-box; text-align: center; background-color: ${invertColors ? 'black' : 'white'}; color: ${invertColors ? 'yellow' : 'black'};">
            <h1 style="font-size: ${bandNameFontSize}; margin-bottom: 10px; font-weight: bold;">${bandName}</h1>
            <p style="font-size: 18px; margin-bottom: 5px;">${inputDate}</p>
            <p style="font-size: 18px; margin-bottom: 5px;">${venueName}</p>
            <p style="font-size: 18px; margin-bottom: 20px;">${eventName}</p>
            <ul style="list-style-type: none; padding: 0; margin: 0 auto; text-align: left; max-width: 80%;">
                ${pdfListItemsHtml}
            </ul>
        </div>`;
    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     `${bandName}_セットリスト.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(pdfContentHtml).set(opt).save();
}

function toggleInvert() {
    console.log('白黒反転ボタンクリック');
    invertColors = !invertColors;
    renderSetlist();
    if (previewArea && previewArea.style.display !== 'none') {
        showPreview();
    }
}

// ==================================================================
// --- Session Storage 関連関数 ---
// (saveSetlistToSession は変更なし)
// ==================================================================
function saveSetlistToSession() {
    const dataToSave = {
        items: currentSetlistItems,
        metadata: {
            bandName: bandNameInput ? bandNameInput.value : '',
            eventName: eventNameInput ? eventNameInput.value : '',
            date: dateInput ? dateInput.value : '',
            venueName: venueNameInput ? venueNameInput.value : ''
        }
    };
    try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
        console.error('SessionStorage への保存に失敗しました:', e);
        alert('セットリストの一時保存に失敗しました。ブラウザのストレージ容量を確認してください。');
    }
}

// ==================================================================
// --- ドラフトデータクリア関数 (★ 新規追加) ---
// ==================================================================
/**
 * Session Storageのドラフトデータと表示されている入力フィールドの内容をすべてクリアする
 */
function clearAllDraftData() {
    // ユーザーに最終確認
    if (confirm('現在入力されているセットリスト情報（曲、MC、バンド名、イベント名、日付、会場名）をすべてクリアします。よろしいですか？')) {
        console.log('「入力値をクリア」ボタンがクリックされました。');

        // 1. Session Storageからデータを削除
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        console.log('Session Storage からドラフトデータをクリアしました。キー:', SESSION_STORAGE_KEY);

        // 2. グローバル変数のセットリスト項目を空にする
        currentSetlistItems = [];

        // 3. 各入力フィールドの値を空にする
        if (bandNameInput) bandNameInput.value = '';
        if (eventNameInput) eventNameInput.value = '';
        if (dateInput) dateInput.value = '';
        if (venueNameInput) venueNameInput.value = '';
        if (songInput) songInput.value = ''; // 曲名入力欄もクリア

        // 4. 画面上のセットリスト表示を更新 (空の状態にする)
        renderSetlist();

        // 5. プレビューが表示されていれば、プレビューも更新 (空の状態で)
        if (previewArea && previewArea.style.display !== 'none') {
            showPreview(); // showPreviewを呼び出すと、空のメタデータでプレビューが再描画される
        }

        alert('入力値をクリアしました。');
        console.log('入力フィールドとセットリスト表示をクリアしました。');
    } else {
        console.log('入力値のクリアはキャンセルされました。');
    }
}


console.log('--- setlist.js (Vite) ロード終了 ---');