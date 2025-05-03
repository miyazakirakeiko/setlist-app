<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Song; // Songモデルを use
use Illuminate\Support\Facades\Auth; // Auth を use

class SetlistController extends Controller
{
    /**
     * セットリスト作成画面を表示
     */
    public function create()
    {
        // ログインユーザーの曲リストを取得
        $songs = collect(); // 空のコレクションで初期化 (未ログイン時など)
        if (Auth::check()) { // ログインしているか確認
            $songs = Auth::user()->songs()->orderBy('title')->get();
        }

        // ★ ビュー名を 'setlist' にする (setlist.blade.php を使う場合)
        return view('setlist', [
            'songs' => $songs
        ]);
    }

    // 他に必要なメソッドがあればここに追加
}