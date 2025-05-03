<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('songs', function (Blueprint $table) { // 'songs' は実際のテーブル名に合わせる
            // usersテーブルのidを参照する外部キー制約付きのカラムを追加
            // nullable() を一時的につけておく（既存データがある場合のエラー回避）
            $table->foreignId('user_id') // カラム名
                  ->after('id')          // 'id'カラムの後に追加 (任意)
                  ->nullable()           // NULLを許容 (一時的)
                  ->constrained()        // usersテーブルへの外部キー制約
                  ->cascadeOnDelete();   // ユーザー削除時に曲も削除 (任意)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('songs', function (Blueprint $table) { // 'songs' は実際のテーブル名に合わせる
            // 外部キー制約を先に削除してからカラムを削除
            $table->dropForeign(['user_id']); // カラム名を配列で指定
            $table->dropColumn('user_id');
        });
    }
};
