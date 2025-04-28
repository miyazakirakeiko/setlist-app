<?php

namespace App\Http\Controllers;

use App\Models\Song;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule; // Ruleファサードをuse

class SongListController extends Controller
{
    /**
     * R: Read (一覧表示)
     * 登録されている曲のリストをページネーション付きで表示
     */
    public function index()
    {
        $songs = Song::orderBy('title')->paginate(20); // 1ページあたり20件表示
        return view('songs.manage', ['songs' => $songs]); // ビュー名を 'songs.manage' に
    }

    /**
     * C: Create (新規登録処理)
     * 新しい曲をデータベースに登録する
     */
    public function store(Request $request)
    {
        // バリデーション
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('songs', 'title') // songsテーブルのtitleカラムでユニーク
            ],
        ],[
            // カスタムエラーメッセージ (任意)
            'title.required' => '曲名を入力してください。',
            'title.unique'   => 'その曲名は既に登録されています。',
            'title.max'      => '曲名は255文字以内で入力してください。',
        ]);

        // DBに保存
        Song::create($validated);

        // 成功したらメッセージ付きで一覧ページにリダイレクト
        return redirect()->route('songs.manage')
                         ->with('success', '新しい曲「' . $validated['title'] . '」を登録しました。');
    }

    /**
     * R: Read (編集画面表示)
     * 指定された曲の編集フォームを表示
     */
    public function edit(Song $song) // ルートモデルバインディング
    {
        return view('songs.edit', ['song' => $song]); // 編集用ビューを返す
    }

    /**
     * U: Update (更新処理)
     * 指定された曲の情報を更新する
     */
    public function update(Request $request, Song $song) // 更新リクエストと対象モデルを受け取る
    {
        // バリデーション (更新時は自分自身のタイトルを除外してユニークチェック)
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('songs')->ignore($song->id), // ★重要: 更新対象を除外
            ],
        ],[
            'title.required' => '曲名を入力してください。',
            'title.unique'   => 'その曲名は既に他の曲で登録されています。',
            'title.max'      => '曲名は255文字以内で入力してください。',
        ]);

        // DBを更新
        $song->update($validated);

        // 成功したらメッセージ付きで一覧ページにリダイレクト
        return redirect()->route('songs.manage')
                         ->with('success', '曲名を「' . $validated['title'] . '」に更新しました。');
    }

    /**
     * D: Delete (削除処理)
     * 指定された曲をデータベースから削除する
     */
    public function destroy(Song $song) // ルートモデルバインディング
    {
        try {
            $songTitle = $song->title; // メッセージ用に曲名を取得
            $song->delete(); // 削除実行
            return redirect()->route('songs.manage')
                             ->with('success', '曲「' . $songTitle . '」を削除しました。');
        } catch (\Exception $e) {
            report($e);
            return redirect()->route('songs.manage')
                             ->with('error', '曲の削除中にエラーが発生しました。');
        }
    }
}