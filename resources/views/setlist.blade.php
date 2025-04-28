<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>セットリスト作ろうくん</title>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@200;500&display=swap"
    />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@200;500&display=swap"
    />

    <!-- CSS -->
    <link rel="stylesheet" href="{{ asset('styles.css') }}" />
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body>
    <div class="bg-white py-6 sm:py-8 lg:py-12">
        <div class="mx-auto max-w-screen-2xl px-4 md:px-8">
            <div class="mb-10 md:mb-6">
                <h1 class="mb-4 text-center text-2xl font-bold text-gray-800 md:mb-6 lg:text-3xl">
                    セットリスト作ろうくん
                </h1>
                <p class="mx-auto max-w-screen-md text-center text-gray-500 md:text-lg">
                    このアプリではコンサート時、アーティストの足元に置かれている曲目表<br />
                    「セットリスト」を簡単に生成できます。
                </p>
            </div>
        </div>

        <!-- 入力セクション -->
        <div id="band-info" class="space-y-4 p-6 max-w-md mx-auto">
            <!-- バンド名、イベント名、日付、会場名 -->
            <input
              type="text"
              id="band-name"
              placeholder="バンド名を入力"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              id="event-name"
              placeholder="イベント名を入力"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div class="flex items-center">
                <input
                  type="date"
                  id="date-input"
                  class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <input
              type="text"
              id="venue-name"
              placeholder="会場名を入力"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <!-- 曲名入力と登録済み曲の候補表示 -->
            <div class="relative">
                <input
                  type="text"
                  id="song-input"
                  placeholder="曲名を入力または選択"
                  class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  list="song-suggestions"
                  autocomplete="off"
                />
                <datalist id="song-suggestions">
                  <!-- JavaScriptで動的に候補が追加されます -->
                </datalist>
                {{-- 新規登録ボタンは削除されました --}}
            </div>

            <!-- 曲追加/MC追加ボタン -->
            <div id="setlist-form" class="flex justify-center space-x-4 mt-4">
                <button
                  onclick="addSelectedSong()" {{-- この関数内で自動登録処理を行う --}}
                  class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  曲を追加
                </button>
                <button
                  onclick="addMC()"
                  class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  MCを追加
                </button>
                <a href="{{ route('songs.manage') }}" {{-- ルート名を確認 --}}
               class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out">
                登録曲リスト
            </a>

            </div>

            <!-- セットリスト表示エリア -->
            <ul id="setlist" class="max-w-md mx-auto mt-6"></ul>
        </div>

        <!-- 操作ボタン群 -->
        <div class="flex justify-center space-x-4 mt-8">
            <button
              class="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700"
              onclick="showPreview()"
            >
              プレビューを表示
            </button>
            <button
              class="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700"
              onclick="generatePDF()"
            >
              PDF出力
            </button>
            <button
              class="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700"
              onclick="toggleInvert()"
              id="toggle-invert"
            >
              白黒反転
            </button>
        </div>

        <!-- プレビューエリア -->
        <div id="preview-area" style="display: none; margin-top: 20px;">
            <h2 class="text-center text-xl font-semibold mb-4">プレビュー</h2>
            <div id="preview-content" class="flex justify-center"></div>
        </div>
    </div>

    <!-- 外部ライブラリ -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.14.0/Sortable.min.js"></script>

    <!-- アプリケーションのJavaScript -->
    <script src="{{ asset('setlist.js') }}"></script>
</body>
</html>