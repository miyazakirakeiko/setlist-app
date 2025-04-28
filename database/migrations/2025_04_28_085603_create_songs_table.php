<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        // 'songs' という名前のテーブルを作成する定義
        Schema::create('songs', function (Blueprint $table) {
            // idカラム: 主キー、自動増分する整数型
            $table->id();

            // titleカラム: 文字列型(VARCHAR)、ユニーク制約付き (同じ曲名は登録できない)
            $table->string('title')->unique();

            // timestampsカラム: created_atとupdated_atカラム (日付時刻型)
            // Laravelがレコード作成日時と更新日時を自動で記録します
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     * (マイグレーションを取り消す際の処理)
     *
     * @return void
     */
    public function down(): void
    {
        // 'songs' テーブルが存在すれば削除する
        Schema::dropIfExists('songs');
    }
};