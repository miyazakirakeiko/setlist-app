<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('songs', function (Blueprint $table) {
            $table->id();

            // ★★★ user_id カラムを追加 ★★★
            // usersテーブルのidを参照する外部キーとして設定し、
            // ユーザーが削除されたら関連する曲も削除する (cascade)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // ★★★ title カラムの unique() を削除 ★★★
            // title はユーザーごとには重複しても良い場合が多い
            // (システム全体でユニークにしたい場合は残す)
            $table->string('title'); // unique() を削除

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('songs');
    }
};