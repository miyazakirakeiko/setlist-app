{{-- resources/views/setlist.blade.php --}}
<x-app-layout>

    {{-- ページヘッダー --}}
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            <span class="align-middle">セットリスト作ろうくん</span>
        </h2>
    </x-slot>

    {{-- メインコンテンツ --}}
    <div class="py-6">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">

                    <div class="mb-6 md:mb-4">
                        <p class="mx-auto max-w-screen-md text-center text-gray-500 md:text-lg">
                            このアプリではコンサート時、アーティストの足元に置かれている曲目表<br />
                            「セットリスト」を簡単に生成できます。
                        </p>
                    </div>

                    <!-- 入力セクション -->
                    <div id="band-info" class="space-y-4 p-6 max-w-md mx-auto">
                        {{-- バンド名などの入力欄 (変更なし) --}}
                        <input type="text" id="band-name" placeholder="バンド名を入力" class="w-full p-3 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" />
                        <input type="text" id="event-name" placeholder="イベント名を入力" class="w-full p-3 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" />
                        <div class="flex items-center">
                            <input type="date" id="date-input" class="w-full p-3 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" />
                        </div>
                        <input type="text" id="venue-name" placeholder="会場名を入力" class="w-full p-3 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" />
                        <div class="relative">
                            <input type="text" id="song-input" placeholder="曲名を入力または選択" class="w-full p-3 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" list="song-suggestions" autocomplete="off" />
                             {{-- ★★★ datalist の中身を修正 ★★★ --}}
                            <datalist id="song-suggestions">
                                {{-- コントローラーから渡された $songs で候補を表示 --}}
                                @if(isset($songs) && $songs->count() > 0)
                                    @foreach($songs as $song)
                                        <option value="{{ $song->title }}">
                                    @endforeach
                                @endif
                            </datalist>
                        </div>

                        <!-- 曲追加/MC追加ボタン/登録曲リスト (変更なし) -->
                        <div id="setlist-form" class="flex justify-center space-x-4 mt-4">
                            <button id="add-song-button" class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">曲を追加</button>
                            <button id="add-mc-button" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">MCを追加</button>
                            <a href="{{ route('songs.manage') }}"
                               class="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-500 focus:bg-gray-500 active:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                登録曲リスト
                            </a>
                        </div>
                        {{-- ★★★ セットリスト表示を ul に変更（元のコードに合わせて） ★★★ --}}
                        <ul id="setlist" class="max-w-md mx-auto mt-6 space-y-2">
                           {{-- JavaScriptで動的に生成される --}}
                        </ul>
                    </div>

                    <!-- 操作ボタン群 (変更なし) -->
                    <div class="flex justify-center space-x-4 mt-8">
                        <button id="show-preview-button" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">プレビューを表示</button>
                        <button id="generate-pdf-button" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">PDF出力</button>
                        <button id="toggle-invert-button" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">白黒反転</button>
                    </div>

                    <!-- プレビューエリア (変更なし) -->
                    <div id="preview-area" style="display: none; margin-top: 20px;">
                        <h2 class="text-center text-xl font-semibold mb-4">プレビュー</h2>
                        <div id="preview-content" class="flex justify-center"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- ★★★ @push('scripts') の中身を修正 ★★★ --}}
    @push('scripts')
        {{-- 外部ライブラリ (変更なし) --}}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.14.0/Sortable.min.js"></script>

        {{-- ★★★ JavaScript に URL と CSRF トークンを渡す ★★★ --}}
        <script>
            // グローバル変数として定義し、setlist.js から参照できるようにする
            window.findOrCreateSongUrl = '{{ route('songs.findOrCreate') }}';
            window.csrfToken = '{{ csrf_token() }}';
        </script>

        {{-- アプリケーションのJavaScript (Viteで読み込む) (変更なし) --}}
        @vite('resources/js/setlist.js')
    @endpush

</x-app-layout>