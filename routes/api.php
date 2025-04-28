<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SongController; // これを忘れずに！

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// デフォルトで存在する Sanctum 用のルート (なければこれも追加)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// 曲リスト取得 (GET /api/songs)
Route::get('/songs', [SongController::class, 'index']);

// 曲登録 (POST /api/songs)
Route::post('/songs', [SongController::class, 'store']);

// Route::delete('/songs/{song}', [SongController::class, 'destroy'])->name('api.songs.destroy'); // destroyメソッドを呼び出す