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
                {{-- キャンセルボタン（一覧へ戻る） --}}
                <a href="{{ route('songs.manage') }}" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    キャンセル
                </a>
                {{-- 更新ボタン --}}
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    更新する
                </button>
            </div>
        </form>
    </div>
</body>
</html>