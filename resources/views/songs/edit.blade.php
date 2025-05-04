<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>曲名の編集</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-4 sm:p-8 font-sans">
    <div class="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">曲名の編集</h1>

        {{-- 更新フォーム (PUT /manage-songs/{song}) --}}
        <form action="{{ route('songs.update', $song) }}" method="POST">
            @csrf  {{-- CSRF対策 --}}
            @method('PUT') {{-- HTTPメソッドをPUTに偽装 --}}

            <div class="mb-4">
                <label for="title" class="block text-sm font-medium text-gray-700 mb-1">曲名</label>
                <input type="text" name="title" id="title"
                       value="{{ old('title', $song->title) }}" {{-- エラー時はold値、なければ現在の曲名 --}}
                       required maxlength="255"
                       class="w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 @error('title') border-red-500 @else border-gray-300 @enderror">
                {{-- バリデーションエラーメッセージ --}}
                @error('title')
                    <p class="text-red-600 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="flex items-center justify-end space-x-3 mt-6">
                {{-- ★★★ キャンセルボタンのクラスを変更 ★★★ --}}
                <a href="{{ route('songs.manage') }}" class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                    キャンセル
                </a>
                 {{-- 参考: もしセカンダリボタン風 (白背景・グレー文字・枠線) にしたい場合はこちらを使う --}}
                 {{--
                 <a href="{{ route('songs.manage') }}" class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                     キャンセル
                 </a>
                 --}}

                {{-- ★★★ 更新ボタンのクラスを変更 ★★★ --}}
                <button type="submit" class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                    更新する
                </button>
            </div>
        </form>
    </div>
</body>
</html>