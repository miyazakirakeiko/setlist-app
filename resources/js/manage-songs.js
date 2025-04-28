// CSRFトークンを取得
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// メッセージ表示要素を取得
const messageElement = document.getElementById('add-song-message');
const songListContainer = document.getElementById('song-list-container');
const noSongsMessage = document.getElementById('no-songs-message');

/**
 * メッセージを表示し、一定時間後に消す関数
 * @param {string} text 表示するメッセージ
 * @param {string} color 'green' or 'red'
 */
function showMessage(text, color = 'green') {
    if (!messageElement) return;
    messageElement.textContent = text;
    messageElement.className = `text-sm mt-2 h-5 ${color === 'green' ? 'text-green-600' : 'text-red-600'}`;
    setTimeout(() => {
        if (messageElement.textContent === text) { // 他のメッセージで上書きされてなければ消す
             messageElement.textContent = '';
        }
    }, 3000); // 3秒後にメッセージを消す
}

/**
 * 新しい曲を追加する関数
 */
async function addSong() {
    const input = document.getElementById('new-song-title-input');
    const title = input.value.trim();
    const addButton = input.nextElementSibling; // 追加ボタンを取得

    if (title === "") {
        showMessage('曲名を入力してください。', 'red');
        input.focus();
        return;
    }

    addButton.disabled = true; // ボタン無効化
    addButton.textContent = '追加中...';

    try {
        // 既存のPOST /api/songs エンドポイントを使用 (firstOrCreateが便利)
        const response = await fetch('/api/songs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ title: title })
        });

        const data = await response.json();

        if (response.ok) { // 200 or 201
             // 成功メッセージ
             const message = response.status === 201 ? `「${data.title}」を追加しました。` : `「${data.title}」は既に登録されています。`;
             showMessage(message, 'green');
             input.value = ''; // 入力欄クリア

             // リストを動的に更新するか、ページリロードを促す
             // 簡単のためページリロードを促す例:
             if(response.status === 201){ // 新規追加の場合のみリロード推奨
                if(confirm(message + "\nリストを更新しますか？")) {
                    location.reload();
                }
             }
             // addNewSongToList(data.id, data.title); // 動的に追加する場合の関数呼び出し（別途実装）

        } else if (response.status === 422) {
             showMessage('エラー: ' + Object.values(data.errors).flat().join("\n"), 'red');
        } else {
             const message = data.message || `HTTP error! status: ${response.status}`;
             throw new Error(message);
        }
    } catch (error) {
        console.error("曲の追加に失敗しました:", error);
        showMessage(`エラーが発生しました: ${error.message}`, 'red');
    } finally {
        addButton.disabled = false; // ボタン有効化
        addButton.textContent = '追加';
    }
}

/**
 * 指定されたIDの曲を削除する関数
 * @param {number} songId 削除する曲のID
 * @param {string} songTitle 確認メッセージ用
 */
async function deleteSong(songId, songTitle) {
    if (!confirm(`曲「${songTitle}」を削除してもよろしいですか？`)) {
        return; // キャンセルされたら何もしない
    }

    const deleteButton = event.target; // クリックされたボタンを取得
    deleteButton.disabled = true;
    deleteButton.textContent = '削除中';

    try {
        const response = await fetch(`/api/songs/${songId}`, { // DELETEリクエスト
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        });

        if (response.status === 204) { // No Content (成功)
             showMessage(`「${songTitle}」を削除しました。`, 'green');
             // リストから要素を削除するアニメーション（任意）
             const listItem = document.getElementById(`song-item-${songId}`);
             if (listItem) {
                listItem.classList.add('fade-out');
                // アニメーション完了後に要素を完全に削除
                listItem.addEventListener('transitionend', () => {
                    listItem.remove();
                    // もしリストが空になったら「登録なし」メッセージ表示
                    if (songListContainer && songListContainer.children.length === 0 && noSongsMessage) {
                         noSongsMessage.style.display = 'block'; // 表示する
                    }
                });
             }
             // アニメーションなしの場合:
             // if (listItem) { listItem.remove(); }
             // if (songListContainer && songListContainer.children.length === 0 && noSongsMessage) { ... }

        } else {
             const data = await response.json().catch(() => ({})); // エラーレスポンス取得試行
             const message = data.message || `削除中にエラーが発生しました (${response.status})`;
             throw new Error(message);
        }
    } catch (error) {
        console.error("曲の削除に失敗しました:", error);
        showMessage(`エラー: ${error.message}`, 'red');
        deleteButton.disabled = false; // エラー時はボタンを戻す
        deleteButton.textContent = '削除';
    }
    // finally ブロックはここでは不要 (成功時は要素が消えるため)
}

// (必要であれば他の初期化処理や関数を追加)