<?php

use Illuminate\Support\Facades\Route;
// ★ SetlistController を use する (まだなければ作成してください)
use App\Http\Controllers\SetlistController;
use App\Http\Controllers\SongListController; // 既存の曲管理コントローラー
use App\Http\Controllers\ProfileController;

// --- 認証が必要なルート ---
Route::middleware('auth')->group(function () {

    // ↓↓↓ ルート '/' を SetlistController@create に変更 ↓↓↓
    // セットリスト作成画面 (DBから曲リストを取得してビューに渡す)
    Route::get('/', [SetlistController::class, 'create'])->name('home'); // ← 変更

    // 楽曲管理のルート群 (既存)
    Route::get('/manage-songs', [SongListController::class, 'index'])->name('songs.manage'); // 'songs.index' の方が一般的かも
    Route::post('/manage-songs', [SongListController::class, 'store'])->name('songs.store'); // 管理画面からの追加用
    Route::get('/manage-songs/{song}/edit', [SongListController::class, 'edit'])->name('songs.edit');
    Route::put('/manage-songs/{song}', [SongListController::class, 'update'])->name('songs.update');
    Route::delete('/manage-songs/{song}', [SongListController::class, 'destroy'])->name('songs.destroy');

    // ↓↓↓ Ajax通信用のルートを追加 ↓↓↓
    // 曲名を送信し、DBで検索または作成して結果を返すエンドポイント
    Route::post('/songs/find-or-create', [SongListController::class, 'findOrCreate'])->name('songs.findOrCreate'); // ← 追加

    // Breezeが生成したダッシュボードルート (不要ならコメントアウト or 削除)
    // Route::get('/dashboard', function () {
    //     return view('dashboard');
    // })->name('dashboard');

    // プロファイル関連ルート (既存)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


}); // ← middleware('auth')->group() の終わり

// Breezeの認証関連ルートの読み込み
require __DIR__.'/auth.php';