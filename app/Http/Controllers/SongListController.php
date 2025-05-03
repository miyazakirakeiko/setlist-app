<?php

namespace App\Http\Controllers;

use App\Models\Song; // Songモデルをuse
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Authファサードをuse
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log; // Logファサードをuse

class SongListController extends Controller
{
    // --- 既存の index, store, edit, update, destroy メソッド (ユーザー提供のコード) ---
    public function index()
    {
        $songs = Auth::user()->songs()->orderBy('title')->paginate(20);
        return view('songs.manage', ['songs' => $songs]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => [
                'required', 'string', 'max:255',
                Rule::unique('songs', 'title')->where(function ($query) {
                    return $query->where('user_id', auth()->id());
                })
            ],
        ],[
            'title.required' => '曲名を入力してください。',
            'title.unique'   => 'その曲名は既に登録されています。',
            'title.max'      => '曲名は255文字以内で入力してください。',
        ]);
        Auth::user()->songs()->create($validated);
        return redirect()->route('songs.manage')
                         ->with('success', '新しい曲「' . $validated['title'] . '」を登録しました。');
    }

    public function edit(Song $song)
    {
        if ($song->user_id !== auth()->id()) { abort(403); }
        return view('songs.edit', ['song' => $song]);
    }

    public function update(Request $request, Song $song)
    {
        if ($song->user_id !== auth()->id()) { abort(403); }
        $validated = $request->validate([
            'title' => [
                'required', 'string', 'max:255',
                Rule::unique('songs')->ignore($song->id)->where(function ($query) {
                    return $query->where('user_id', auth()->id());
                })
            ],
        ],[
            'title.required' => '曲名を入力してください。',
            'title.unique'   => 'その曲名は既に他の曲で登録されています。',
            'title.max'      => '曲名は255文字以内で入力してください。',
        ]);
        $song->update($validated);
        return redirect()->route('songs.manage')
                         ->with('success', '曲名を「' . $validated['title'] . '」に更新しました。');
    }

    public function destroy(Song $song)
    {
        if ($song->user_id !== auth()->id()) { abort(403); }
        try {
            $songTitle = $song->title;
            $song->delete();
            return redirect()->route('songs.manage')
                             ->with('success', '曲「' . $songTitle . '」を削除しました。');
        } catch (\Exception $e) {
            report($e);
            return redirect()->route('songs.manage')
                             ->with('error', '曲の削除中にエラーが発生しました。');
        }
    }

    /**
     * ★★★ Ajaxリクエストを受け、ログインユーザーの曲を検索または作成して返す ★★★
     * (ユーザーごとの管理に対応)
     */
    public function findOrCreate(Request $request)
    {
        // ログインチェック (ルートで 'auth' middleware がかかっている前提)
        if (!Auth::check()) {
            return response()->json(['success' => false, 'message' => '認証が必要です。'], 401);
        }

        // バリデーション (文字数制限など基本的なもの)
        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ],[
            'title.required' => '曲名を入力してください。',
            'title.max'      => '曲名は255文字以内で入力してください。',
        ]);

        $title = trim($validated['title']);
        $userId = auth()->id(); // ログインユーザーID

        if (empty($title)) {
             return response()->json(['success' => false, 'message' => '曲名が空です。'], 400);
        }

        try {
            // ★ firstOrCreate を user_id と title で検索・作成するように変更
            // 第一引数: 検索/作成の属性 (user_id と title で特定)
            $song = Song::firstOrCreate(
                [
                    'user_id' => $userId,
                    'title' => $title
                ]
                // 第二引数は通常不要 (user_idとtitle以外のカラムにデフォルト値を入れたい場合のみ)
            );

            // 成功したら、作成/取得した曲の情報を返す
            return response()->json([
                'success' => true,
                'song' => $song, // id, user_id, title などが含まれる
            ]);

        } catch (\Exception $e) {
            // エラーログを記録 (ユーザーIDも入れておくと追跡しやすい)
            Log::error('Song findOrCreate failed for user ' . $userId . ': ' . $e->getMessage());
            // エラーレスポンスを返す
            return response()->json([
                'success' => false,
                'message' => '曲の処理中にサーバーエラーが発生しました。',
            ], 500);
        }
    }
}