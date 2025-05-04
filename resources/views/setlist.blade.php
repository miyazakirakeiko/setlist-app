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
                             {{-- datalist の中身 (変更なし) --}}
                            <datalist id="song-suggestions">
                                @if(isset($songs) && $songs->count() > 0)
                                    @foreach($songs as $song)
                                        <option value="{{ $song->title }}">
                                    @endforeach
                                @endif
                            </datalist>
                        </div>

                        <!-- 曲追加/MC追加ボタン/登録曲リスト (Breezeスタイル適用) -->
                        <div id="setlist-form" class="flex justify-center space-x-4 mt-4">
                             {{-- 曲を追加ボタン --}}
                             <button id="add-song-button" class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">曲を追加</button>
                             {{-- MCを追加ボタン --}}
                             <button id="add-mc-button" class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">MCを追加</button>
                             {{-- 登録曲リスト --}}
                             <a href="{{ route('songs.manage') }}"
                                class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                 登録曲リスト
                             </a>
                         </div>
                        {{-- セットリスト表示 (変更なし) --}}
                        <ul id="setlist" class="max-w-md mx-auto mt-6 space-y-2">
                           {{-- JavaScriptで動的に生成される --}}
                        </ul>
                    </div>

                    <!-- 操作ボタン群 (Breezeスタイル適用) -->
                    <div class="flex justify-center space-x-4 mt-8">
                         {{-- プレビューを表示ボタン --}}
                         <button id="show-preview-button" class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">プレビューを表示</button>
                         {{-- PDF出力ボタン --}}
                         <button id="generate-pdf-button" class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">PDF出力</button>
                         {{-- 白黒反転ボタン --}}
                         <button id="toggle-invert-button" class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">白黒反転</button>
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

    {{-- スクリプト部分 (変更なし) --}}
    @push('scripts')
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.14.0/Sortable.min.js"></script>

        <script>
            window.findOrCreateSongUrl = '{{ route('songs.findOrCreate') }}';
            window.csrfToken = '{{ csrf_token() }}';
        </script>

        @vite('resources/js/setlist.js')
    @endpush

</x-app-layout>