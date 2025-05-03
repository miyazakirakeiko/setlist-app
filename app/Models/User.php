<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany; // HasManyを追加済み
use App\Models\Song; // Songモデルをuse済み

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ↓↓↓ ここに songs() メソッドを追加 ↓↓↓
    /**
     * ユーザーが所有する曲を取得
     * (Get the songs for the user.)
     */
    public function songs(): HasMany
    {
        // リレーションを定義: User はたくさんの Song を持つ (hasMany)
        return $this->hasMany(Song::class); // Songモデルを指定
    }
    // ↑↑↑ ここに songs() メソッドを追加 ↑↑↑
}