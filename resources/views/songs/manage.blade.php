<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>登録曲の管理</title>
    <script src="https://cdn.tailwindcss.com"></script>
    {{-- CSSが必要なら読み込み --}}
    {{-- <link rel="stylesheet" href="{{ asset('styles.css') }}"> --}}
</head>
<body class="bg-gray-100 p-4 sm:p-8 font-sans">
    <div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">登録曲の管理</h1>

        {{-- フラッシュメッセージ表示エリア --}}
        @if (session('success'))
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span class="block sm:inline">{{ session('success') }}</span>
            </div>
        @endif
        @if (session('error'))
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span class="block sm:inline">{{ session('error') }}</span>
            </div>
        @endif

        {{-- 曲追加フォーム (POST /manage-songs) --}}
        <form action="{{ route('songs.store') }}" method="POST" class="mb-8 pb-6 border-b">
            @csrf {{-- CSRF対策 --}}
            <h2 class="text-xl font-semibold mb-3 text-gray-700">新しい曲を追加</h2>
            <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <input type="text" name="title" placeholder="曲名を入力" required maxlength="255"
                       class="flex-grow w-full sm:w-auto p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 @error('title') border-red-500 @else border-gray-300 @enderror"
                       value="{{ old('title') }}"> {{-- バリデーションエラー時に値を保持 --}}
                {{-- ★★★ 追加ボタンのクラスを変更 ★★★ --}}
                <button type="submit" class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 whitespace-nowrap">
                    追加
                </button>
            </div>
            {{-- バリデーションエラーメッセージ --}}
            @error('title')
                <p class="text-red-600 text-sm mt-1">{{ $message }}</p>
            @enderror
        </form>

        {{-- 登録曲リスト --}}
        <div>
            <h2 class="text-xl font-semibold mb-4 text-gray-700">登録済みリスト</h2>
            @if($songs->count() > 0)
                <ul class="space-y-2">
                    @foreach($songs as $song)
                         <li class="flex items-center justify-between bg-white p-3 rounded border border-gray-200 hover:bg-gray-50 transition duration-150 ease-in-out">
                            {{-- 曲名 --}}
                            <span class="text-gray-800 break-words mr-4">{{ $song->title }}</span>
                            {{-- 操作ボタンエリア --}}
                            <div class="flex-shrink-0 flex items-center space-x-2">
                                {{-- ★★★ 編集ボタン (リンク) のクラスを変更 ★★★ --}}
                                <a href="{{ route('songs.edit', $song) }}" {{-- 編集ページへのリンク --}}
                                   class="inline-flex items-center px-3 py-1 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 whitespace-nowrap">
                                    編集
                                </a>
                                {{-- ★★★ 削除ボタン (フォーム) のクラスを変更 ★★★ --}}
                                <form action="{{ route('songs.destroy', $song) }}" method="POST" onsubmit="return confirm('「{{ e($song->title) }}」を本当に削除しますか？');" class="inline"> {{-- formをinlineに --}}
                                    @csrf {{-- CSRF --}}
                                    @method('DELETE') {{-- DELETEメソッド指定 --}}
                                     {{-- 色もグレーに統一する場合 --}}
                                    <button type="submit" class="inline-flex items-center px-3 py-1 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 whitespace-nowrap">
                                        削除
                                    </button>
                                     {{-- もし赤色を残したい場合はこちらを使う --}}
                                     {{--
                                     <button type="submit" class="inline-flex items-center px-3 py-1 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150 whitespace-nowrap">
                                         削除
                                     </button>
                                     --}}
                                </form>
                            </div>
                        </li>
                    @endforeach
                </ul>
                {{-- ページネーションリンク --}}
                <div class="mt-6">
                    {{ $songs->links() }} {{-- ページネーションのリンクを表示 --}}
                </div>
            @else
                <p class="text-gray-500">現在、登録されている曲はありません。</p>
            @endif
        </div>

        {{-- セットリスト作成ページに戻るリンク --}}
        <div class="mt-8 pt-4 border-t border-gray-200">
             {{-- ★★★ 戻るリンクをボタン風に変更 ★★★ --}}
            <a href="{{ url('/') }}" class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                « セットリスト作成に戻る
            </a>
             {{-- リンクのままが良い場合はこちらを使う --}}
             {{--
             <a href="{{ url('/') }}" class="text-blue-600 hover:text-blue-800 hover:underline">
                 « セットリスト作成に戻る
             </a>
             --}}
        </div>
    </div>
    {{-- JavaScriptファイルは不要になったので削除 or コメントアウト --}}
    {{-- <script src="{{ asset('js/manage-songs.js') }}"></script> --}}
</body>
</html>