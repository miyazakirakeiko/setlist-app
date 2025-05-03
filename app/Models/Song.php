<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User; // Userモデルをuseするのを忘れずに
use Illuminate\Database\Eloquent\Relations\BelongsTo; // BelongsToをuseするのを忘れず

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
        'artist', // 例: 元々あったカラム
        'user_id', // これを追加！
  
    ];
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}