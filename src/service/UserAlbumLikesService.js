const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLike(userId, albumId) {
    const id = `like-${nanoid(16)}`;

    // Verify if album is exist
    await this.verifyAlbumExist(albumId);

    // Verify if you already like the album
    const isLiked = await this.verifyLikeExist(userId, albumId);

    if (isLiked) {
      throw new InvariantError("Anda sudah menyukai album ini");
    }

    const query = {
      text: "INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id",
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Gagal menyukai album");
    }

    await this.deleteCache(albumId);
  }

  async deleteLike(userId, albumId) {
    const query = {
      text: "DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id",
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Like tidak ditemukan");
    }

    await this.deleteCache(albumId);
  }

  async getLikesCount(albumId) {
    const cached = await this._cacheService.get(`likes:${albumId}`);
    if (cached !== null) {
      return { cached: true, count: cached };
    }

    const query = {
      text: "SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1",
      values: [albumId],
    };

    const result = await this._pool.query(query);
    const count = parseInt(result.rows[0].count, 10);

    await this._cacheService.set(`likes:${albumId}`, count);

    return { cached: false, count };
  }

  async verifyLikeExist(userId, albumId) {
    const query = {
      text: "SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2",
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    return result.rows.length > 0;
  }

  async verifyAlbumExist(albumId) {
    const query = {
      text: "SELECT id FROM albums WHERE id = $1",
      values: [albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Album tidak ditemukan");
    }
  }

  async deleteCache(albumId) {
    await this._cacheService.delete(`likes:${albumId}`);
  }
}

module.exports = UserAlbumLikesService;
