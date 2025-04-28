<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Song extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * (複数代入可能な属性)
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title', // 'title'カラムへの代入を許可
        // 'artist', // アーティストカラムを追加した場合
    ];
}