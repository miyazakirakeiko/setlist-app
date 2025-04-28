<?php

namespace App\Http\Controllers\Api; // 名前空間を確認

use App\Http\Controllers\Controller;
use App\Models\Song;        // Songモデルをuse
use Illuminate\Http\Request;
// use Illuminate\Validation\ValidationException; // firstOrCreateを使う場合は不要になることも

class SongController extends Controller
{
    /**
     * 登録されている曲のリストを取得 (GET /api/songs)
     * (変更なし)
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $songs = Song::orderBy('title')->get();
        return response()->json($songs);
    }

    /**
     * 新しい曲を登録、または既存のものを取得 (POST /api/songs)
     * 【★ firstOrCreate を使うように修正 ★】
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // バリデーション (unique制約は不要に)
        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ],[
            'title.required' => '曲名を入力してください。',
            'title.max'      => '曲名は255文字以内で入力してください。',
        ]);

        try {
            // 指定されたtitleで検索し、存在すれば取得、なければ新規作成して保存
            $song = Song::firstOrCreate(
                ['title' => $validated['title']] // この条件で検索・作成
            );

            $statusCode = $song->wasRecentlyCreated ? 201 : 200; // 新規作成なら201, 既存取得なら200

            return response()->json($song, $statusCode);

        } catch (\Exception $e) {
            report($e);
            return response()->json(['message' => '処理中にエラーが発生しました。'], 500);
        }
    }

    /**
     * 指定された曲を削除 (DELETE /api/songs/{song})
     * 【★ destroy メソッドを追加 ★】
     * @param  \App\Models\Song  $song ルートモデルバインディングで取得
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Song $song) // ルートモデルバインディングでSongインスタンスを受け取る
    {
        try {
            $song->delete(); // データベースから削除

            // 成功レスポンス (内容なし、ステータス204 No Content)
            return response()->json(null, 204);

        } catch (\Exception $e) {
            report($e); // エラーログ記録
            return response()->json(['message' => '削除中にエラーが発生しました。'], 500);
        }
    }
}