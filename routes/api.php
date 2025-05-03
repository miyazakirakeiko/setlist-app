<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SongController; // 正しいパスか確認

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// デフォルトの Sanctum ユーザー情報取得ルート
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


// ↓↓↓ 認証が必要なAPIルートグループ ↓↓↓
Route::middleware('web')->group(function () { // 'auth:sanctum' または 'auth' (セッション認証なら)

    // 曲リスト取得 (GET /api/songs) - 認証ユーザーの曲を返す
    Route::get('/songs', [SongController::class, 'index'])->name('api.songs.index'); // ルート名追加 (任意)

    // 曲登録 (POST /api/songs) - 認証ユーザーの曲として登録/取得
    Route::post('/songs', [SongController::class, 'store'])->name('api.songs.store'); // ルート名追加 (任意)

    // 必要であれば削除APIもここに追加
    // Route::delete('/songs/{song}', [SongController::class, 'destroy'])->name('api.songs.destroy');

}); // ← middleware グループの終わり


// ★★★ もし認証なしで全曲リストを返すAPIも必要なら、グループの外に残す ★★★
// Route::get('/all-songs', [SongController::class, 'getAllSongs']); // 例：別のエンドポイントを用意するなど