// --- グローバル変数 ---
const setlist = []; // 現在のセットリスト項目を保持する配列
let invertColors = false; // 白黒反転の状態フラグ
let registeredSongs = []; // DBから取得した登録済み曲リストを保持する配列
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content'); // CSRFトークンを取得

// --- 初期化処理 ---
document.addEventListener('DOMContentLoaded', () => {
    fetchSongs(); // ページ読み込み時にDBから曲リストを取得
    initializeSortable(); // セットリストのドラッグ＆ドロップ機能を初期化
    setupEventListeners(); // その他のイベントリスナーを設定
});

/**
 * イベントリスナーを設定する関数
 */
function setupEventListeners() {
    // 日付入力欄：変更されたらフォーカスを外す
    const dateInput = document.getElementById("date-input");
    if (dateInput) {
        dateInput.addEventListener("change", function () {
            this.blur();
        });
    }
    // 他に必要なイベントリスナーがあればここに追加
}

// --- API通信関連 ---

/**
 * API(/api/songs)から曲リストを取得してdatalistと変数registeredSongsを更新する関数
 */
async function fetchSongs() {
    try {
        const response = await fetch('/api/songs'); // GETリクエスト
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        registeredSongs = await response.json();
        updateSongSuggestions(); // datalistを更新
    } catch (error) {
        console.error("曲リストの取得に失敗しました:", error);
        // ユーザーに通知 (状況に応じて調整)
        // alert("登録されている曲のリストを取得できませんでした。ページを再読み込みしてみてください。");
    }
}

// --- UI更新・操作関連 ---

/**
 * registeredSongs配列の内容をもとに、datalistの候補(<option>)を更新する関数
 */
function updateSongSuggestions() {
    const suggestionsList = document.getElementById('song-suggestions');
    suggestionsList.innerHTML = ''; // 既存の候補をクリア
    registeredSongs.forEach(song => {
        const option = document.createElement('option');
        option.value = song.title;
        suggestionsList.appendChild(option);
    });
}

/**
 * 「曲を追加」ボタンが押されたときに呼び出される関数。 【★ここが新しいロジック★】
 * 入力された曲名が未登録ならDBに自動登録し、セットリストに追加する。
 */
async function addSelectedSong() {
    const songInput = document.getElementById("song-input");
    const songName = songInput.value.trim();

    if (songName === "") {
        alert("曲名を入力してください。");
        return;
    }

    // --- 1. セットリスト内の重複チェック ---
    const alreadyInSetlist = setlist.some(item => item.type === 'song' && item.name.toLowerCase() === songName.toLowerCase());
    if (alreadyInSetlist) {
        alert('この曲は既にセットリストに追加されています。');
        songInput.focus();
        return;
    }

    // --- 2. DBに登録済みかチェック ---
    const isRegistered = registeredSongs.some(song => song.title.toLowerCase() === songName.toLowerCase());

    let songToAdd = { type: "song", name: songName }; // セットリストに追加するデータ (デフォルトは入力値)

    // --- 3. 未登録の場合、DBに登録試行 ---
    if (!isRegistered) {
        console.log(`曲名 "${songName}" は未登録です。DBへの登録を試みます...`);
        const addButton = document.querySelector('#setlist-form button:first-child');
        if (addButton) addButton.disabled = true; // ボタン無効化

        try {
            const response = await fetch('/api/songs', { // POSTリクエストで登録/取得
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ title: songName })
            });

            const data = await response.json();

            if (!response.ok && response.status !== 422) { // 422(バリデーション、主に重複)以外のエラー
                 const message = data.message || `HTTP error! status: ${response.status}`;
                 throw new Error(message);
            }
            // 成功(200/201) or 422(重複等) の場合
            console.log('DBへの登録/取得 完了:', data);
            await fetchSongs(); // 候補リストを更新
            // 必要ならDBから返った正式名称を使う: songToAdd.name = data.title;

        } catch (error) {
            console.error("曲のDB登録/確認中にエラーが発生しました:", error);
            alert(`曲の処理中にエラーが発生しました。\n${error.message}\nセットリストへの追加を中止します。`);
            if (addButton) addButton.disabled = false; // ボタン有効化
            return; // エラー時は追加しない
        } finally {
            if (addButton) addButton.disabled = false; // ボタン有効化
        }
    } else {
         console.log(`曲名 "${songName}" は既にDBに登録済みです。`);
    }

    // --- 4. セットリストに追加 & UI更新 ---
    console.log(`"${songToAdd.name}" をセットリストに追加します。`);
    setlist.push(songToAdd);
    updateSetlist();
    songInput.value = "";
    // handleSongInput() は不要なので呼び出さない
}


/**
 * MCをセットリストに追加する関数
 */
function addMC() {
    if (setlist.length < 20) { // 項目数制限（例）
        setlist.push({ type: "mc", name: "MC" });
        updateSetlist();
    } else {
        alert("セットリストに追加できる項目数の上限に達しました。");
    }
}

/**
 * 指定されたインデックスの項目をセットリストから削除する関数
 */
function deleteItem(index) {
    setlist.splice(index, 1);
    updateSetlist();
}

/**
 * 現在のsetlist配列の内容をもとに、
 * 画面上のセットリスト表示(ul#setlist)を更新する関数
 */
function updateSetlist() {
    const setlistContainer = document.getElementById("setlist");
    setlistContainer.innerHTML = "";

    let songCounter = 1;

    setlist.forEach((item, index) => {
        const listItem = document.createElement("li");
        listItem.className = `flex items-center justify-between border border-gray-300 rounded-md p-2 my-1 transition duration-150 ease-in-out hover:shadow-md cursor-grab ${
            invertColors ? "bg-gray-800 text-white" : "bg-white text-black"
        }`;
        listItem.dataset.index = index;

        const contentSpan = document.createElement("span");
        contentSpan.className = "flex-grow mr-2";
        if (item.type === "song") {
            contentSpan.textContent = `${songCounter}. ${item.name}`;
            songCounter++;
        } else {
            contentSpan.textContent = item.name;
        }
        listItem.appendChild(contentSpan);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "削除";
        deleteButton.className = `px-2 py-1 text-xs text-red-600 hover:text-red-800 ${invertColors ? 'hover:bg-gray-600' : 'hover:bg-red-100'} rounded focus:outline-none focus:ring-1 focus:ring-red-500`;
        deleteButton.onclick = () => deleteItem(index);
        listItem.appendChild(deleteButton);

        setlistContainer.appendChild(listItem);
    });
}

/**
 * SortableJSを初期化して、セットリスト項目をドラッグ＆ドロップで
 * 並び替えられるようにする関数
 */
function initializeSortable() {
    const setlistContainer = document.getElementById("setlist");
    if (setlistContainer) {
        new Sortable(setlistContainer, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: function (evt) {
                const movedItem = setlist.splice(evt.oldIndex, 1)[0];
                setlist.splice(evt.newIndex, 0, movedItem);
                updateSetlist();
            },
        });
    }
}


// --- 既存のプレビュー・PDF・反転機能 (変更なし) ---
// (getFontSizeForPDF, showPreview, generatePDF, toggleInvert 関数はそのまま)

function getFontSizeForPDF(totalItems) {
    if (totalItems > 16) return "20px";
    if (totalItems > 12) return "25px";
    if (totalItems > 8) return "30px";
    if (totalItems > 4) return "40px";
    return "40px";
}

function showPreview() {
    const bandName = document.getElementById("band-name").value.trim() || "バンド名未入力";
    let bandNameFontSize = "24px";
    if (bandName.length >= 16) bandNameFontSize = "17.5px";
    else if (bandName.length >= 11) bandNameFontSize = "20px";

    const eventName = document.getElementById("event-name").value.trim() || "イベント名未入力";
    const inputDate = document.getElementById("date-input").value.trim() || "日付未入力";
    const venueName = document.getElementById("venue-name").value.trim() || "会場名未入力";

    let songNumber = 1;
    const listItemsHtml = setlist.map(item => {
        const style = `font-size: 15px; text-align: left; white-space: normal; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; ${invertColors ? "color: yellow;" : "color: black;"}`;
        if (item.type === "song") {
            return `<li style="${style}">${songNumber++}. ${item.name}</li>`;
        } else {
            return `<li style="${style}">${item.name}</li>`;
        }
    }).join("");

    const previewContentHtml = `
        <div style="width: 105mm; height: 149mm; padding: 15px; box-sizing: border-box; ${
          invertColors
            ? "background-color: black; color: yellow;"
            : "background-color: white; color: black;"
        } border: 1px solid #ccc; display: flex; flex-direction: column; justify-content: flex-start; align-items: center;">
            <h3 style="font-size: ${bandNameFontSize}; text-align: center; margin: 0 0 5px 0; font-weight: bold;">${bandName}</h3>
            <p style="font-size: 9px; text-align: center; margin: 0 0 5px 0;">${inputDate}</p>
            <p style="font-size: 9px; text-align: center; margin: 0 0 5px 0;">${venueName}</p>
            <p style="font-size: 9px; text-align: center; margin: 0 0 10px 0;">${eventName}</p>
            <ul style="list-style-type: none; padding: 0; margin: 0; width: 100%; text-align: left;">
                ${listItemsHtml}
            </ul>
        </div>`;

    document.getElementById("preview-content").innerHTML = previewContentHtml;
    document.getElementById("preview-area").style.display = "block";
}

function generatePDF() {
    const bandName = document.getElementById("band-name").value.trim() || "バンド名未入力";
    const eventName = document.getElementById("event-name").value.trim() || "イベント名未入力";
    const inputDate = document.getElementById("date-input").value.trim() || "日付未入力";
    const venueName = document.getElementById("venue-name").value.trim() || "会場名未入力";

    let bandNameFontSize;
    if (bandName.length >= 16) bandNameFontSize = "35px";
    else if (bandName.length >= 11) bandNameFontSize = "40px";
    else bandNameFontSize = "48px";

    const totalItems = setlist.length;
    const fontSize = getFontSizeForPDF(totalItems);

    let songNumber = 1;
    const pdfListItemsHtml = setlist.map(item => {
        const style = `font-size: ${fontSize}; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 8px; line-height: 1.2;`;
         if (item.type === "song") {
             return `<li style="${style}">${songNumber++}. ${item.name}</li>`;
         } else {
             return `<li style="${style} white-space: normal;">${item.name}</li>`;
         }
    }).join("");

    const pdfContentHtml = `
        <div style="width: 100%; padding: 20mm; box-sizing: border-box; text-align: center; ${
          invertColors ? "background-color: black; color: yellow;" : ""
        }">
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
    invertColors = !invertColors;
    updateSetlist();
    if (document.getElementById("preview-area").style.display !== 'none') {
        showPreview();
    }
}