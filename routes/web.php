<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SongListController; // これを use

// セットリスト作成ページ
Route::get('/', function () {
    return view('setlist');
});

// --- 曲管理 CRUD 用ルート ---

// R: Read (一覧表示)
Route::get('/manage-songs', [SongListController::class, 'index'])->name('songs.manage');

// C: Create (新規登録処理)
Route::post('/manage-songs', [SongListController::class, 'store'])->name('songs.store');

// R: Read (編集画面表示)
Route::get('/manage-songs/{song}/edit', [SongListController::class, 'edit'])->name('songs.edit');

// U: Update (更新処理)
Route::put('/manage-songs/{song}', [SongListController::class, 'update'])->name('songs.update'); // PUTメソッド使用

// D: Delete (削除処理)
Route::delete('/manage-songs/{song}', [SongListController::class, 'destroy'])->name('songs.destroy');