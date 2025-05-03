// resources/js/setlist.js

console.log('--- setlist.js (Vite) ロード開始 ---');

// --- グローバル変数 ---
let currentSetlistItems = []; // セットリスト項目
let invertColors = false; // 白黒反転の状態フラグ
const csrfToken = window.csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'); // CSRFトークン
const findOrCreateSongUrl = window.findOrCreateSongUrl || '/songs/find-or-create'; // Ajax URL

// --- DOM要素参照 (DOMContentLoaded内で取得) ---
let songInput, setlistDisplay, dataList, addButton, mcButton;
let previewButton, pdfButton, invertButton, previewArea, previewContent;
let bandNameInput, eventNameInput, dateInput, venueNameInput;


// --- 初期化処理 ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM コンテンツ読み込み完了');

    // DOM要素を取得
    songInput = document.getElementById('song-input');
    setlistDisplay = document.getElementById('setlist'); // ul 要素
    dataList = document.getElementById('song-suggestions');
    addButton = document.getElementById('add-song-button');
    mcButton = document.getElementById('add-mc-button');
    previewButton = document.getElementById('show-preview-button');
    pdfButton = document.getElementById('generate-pdf-button'); // ★ 変数名は pdfButton
    invertButton = document.getElementById('toggle-invert-button');
    previewArea = document.getElementById('preview-area');
    previewContent = document.getElementById('preview-content');
    bandNameInput = document.getElementById('band-name');
    eventNameInput = document.getElementById('event-name');
    dateInput = document.getElementById('date-input');
    venueNameInput = document.getElementById('venue-name');


    // 必須要素の存在チェック
    if (!songInput || !setlistDisplay || !dataList || !addButton || !mcButton) {
        console.error('必須のHTML要素 (song-input, setlist, song-suggestions, add-song-button, add-mc-button) が見つかりません。IDを確認してください。');
        return; // 処理中断
    }

    // --- イベントリスナーを設定 ---
    setupEventListeners();

    // --- SortableJSを初期化 ---
    initializeSortable();

    // --- 初期セットリスト表示 ---
    renderSetlist(); // 最初は空のメッセージが表示される

    console.log('初期化完了');
});


// --- 関数定義 ---

/**
 * イベントリスナーを設定する関数
 */
function setupEventListeners() {
    // 日付入力欄：変更されたらフォーカスを外す
    if (dateInput) {
        dateInput.addEventListener("change", function () { this.blur(); });
    }

    // 曲を追加ボタン
    if (addButton) {
        addButton.addEventListener('click', addSong);
    } else { console.error('ID "add-song-button" の要素が見つかりません。'); }

    // MCを追加ボタン
    if (mcButton) {
        mcButton.addEventListener('click', addMC);
    } else {
        console.error('ID "add-mc-button" の要素が見つかりません。');
    }

    // プレビューを表示ボタン
    if (previewButton) {
        previewButton.addEventListener('click', showPreview);
    } else { console.error('ID "show-preview-button" の要素が見つかりません。'); }

    // PDF出力ボタン
    // ↓↓↓ ★★★ ここを修正 ★★★ ↓↓↓
    if (pdfButton) { // generatePdfButton ではなく pdfButton を参照
        pdfButton.addEventListener('click', generatePDF); // generatePdfButton ではなく pdfButton を参照
    } else { console.error('ID "generate-pdf-button" の要素が見つかりません。'); }
    // ↑↑↑ ★★★ ここを修正 ★★★ ↑↑↑

    // 白黒反転ボタン
    if (invertButton) {
        invertButton.addEventListener('click', toggleInvert);
    } else { console.error('ID "toggle-invert-button" の要素が見つかりません。'); }
}

/**
 * Datalistのオプションを更新する関数 (必要に応じて)
 */
 function updateDatalistOption(title) {
    if (!dataList || !dataList.options) {
        console.warn('Datalist 要素が見つかりません。');
        return;
    }
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


/**
 * 「曲を追加」ボタンが押されたときに呼び出される関数。
 */
async function addSong() {
    if (!songInput) return;
    const songTitle = songInput.value.trim();

    if (songTitle === "") {
        alert("曲名を入力してください。");
        return;
    }

    const alreadyInSetlist = currentSetlistItems.some(item => item.type === 'song' && item.title.toLowerCase() === songTitle.toLowerCase());
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


/**
 * MCをセットリストに追加する関数
 */
function addMC() {
    if (currentSetlistItems.length < 20) {
        currentSetlistItems.push({ type: "mc", title: "MC" });
        renderSetlist();
        console.log('"MC" をセットリストに追加しました。');
    } else {
        alert("セットリストに追加できる項目数の上限に達しました。");
    }
}

/**
 * 指定されたインデックスの項目をセットリストから削除する関数
 */
function deleteItem(index) {
    if (index >= 0 && index < currentSetlistItems.length) {
        const itemTitle = currentSetlistItems[index].title;
        currentSetlistItems.splice(index, 1);
        renderSetlist();
        console.log(`項目 "${itemTitle}" (インデックス ${index}) を削除しました。`);
    }
}

/**
 * 現在のcurrentSetlistItems配列の内容をもとに、
 * 画面上のセットリスト表示(ul#setlist)を更新する関数
 */
function renderSetlist() {
    if (!setlistDisplay) {
        console.error('セットリスト表示エリア (#setlist) が見つかりません。');
        return;
    }
    setlistDisplay.innerHTML = '';
    let songCounter = 1;

    if (currentSetlistItems.length === 0) {
        const li = document.createElement('li');
        li.classList.add('text-gray-500', 'text-center', 'py-4', 'italic');
        li.textContent = 'セットリストは空です。';
        setlistDisplay.appendChild(li);
    } else {
        currentSetlistItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = `flex items-center justify-between border border-gray-300 rounded-md p-2 my-1 transition duration-150 ease-in-out hover:shadow-md cursor-grab group ${
                invertColors ? "bg-gray-800 text-white" : "bg-white text-black"
            }`;
            li.dataset.index = index;
            li.dataset.id = item.type === 'song' ? item.id : `mc-${index}`;

            const contentSpan = document.createElement("span");
            contentSpan.className = "flex-grow mr-2";
            if (item.type === "song") {
                contentSpan.textContent = `${songCounter++}. ${item.title}`;
            } else {
                contentSpan.textContent = item.title;
            }
            li.appendChild(contentSpan);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "削除";
            deleteButton.className = `px-2 py-1 text-xs text-red-600 hover:text-red-800 ${invertColors ? 'hover:bg-gray-600' : 'hover:bg-red-100'} rounded focus:outline-none focus:ring-1 focus:ring-red-500 opacity-0 group-hover:opacity-100 transition-opacity`;
            deleteButton.addEventListener('click', (event) => {
                 event.stopPropagation();
                 deleteItem(index);
            });
            li.appendChild(deleteButton);

            setlistDisplay.appendChild(li);
        });
    }
}


/**
 * SortableJSを初期化する関数
 */
function initializeSortable() {
    if (setlistDisplay && typeof Sortable !== 'undefined') {
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
                }
            },
        });
         console.log('SortableJS 初期化完了');
    } else if (!setlistDisplay) {
         console.error('ID "setlist" の要素が見つかりません。SortableJSを初期化できません。');
    } else {
         console.error('SortableJSが読み込まれていません。');
    }
}


// --- 既存のプレビュー・PDF・反転機能 ---
// (getFontSizeForPDF, showPreview, generatePDF, toggleInvert 関数)

function getFontSizeForPDF(totalItems) {
    if (totalItems > 16) return "20px";
    if (totalItems > 12) return "25px";
    if (totalItems > 8) return "30px";
    if (totalItems > 4) return "40px";
    return "40px";
}

function showPreview() {
    console.log('プレビュー表示ボタンクリック');
    if (!previewArea || !previewContent) return;

    const bandName = bandNameInput?.value.trim() || "バンド名未入力";
    let bandNameFontSize = "24px";
    if (bandName.length >= 16) bandNameFontSize = "17.5px";
    else if (bandName.length >= 11) bandNameFontSize = "20px";

    const eventName = eventNameInput?.value.trim() || "イベント名未入力";
    const inputDate = dateInput?.value.trim() || "日付未入力";
    const venueName = venueNameInput?.value.trim() || "会場名未入力";

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
        margin: [10, 10, 10, 10],
        filename: `${bandName}_セットリスト.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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