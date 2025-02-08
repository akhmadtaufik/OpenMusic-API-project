const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const ForbiddenError = require('../exceptions/ForbiddenError');

class PlaylistsService {
  constructor(collaborationsService, playlistActivitiesService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
    this._playlistActivitiesService = playlistActivitiesService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists (id, name, owner) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `
        SELECT playlists.id, playlists.name, users.username
        FROM playlists
        LEFT JOIN users ON playlists.owner = users.id
        LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
        WHERE playlists.owner = $1 OR collaborations.user_id = $1
        GROUP BY playlists.id, users.username
      `,
      values: [owner],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new ForbiddenError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    // Owner Check
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];
    if (playlist.owner === userId) return;

    // Collaboration Check
    await this._collaborationsService.verifyCollaborator(playlistId, userId);
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    const id = `playlist-song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playist');
    }

    await this._playlistActivitiesService.addActivity(
      playlistId,
      songId,
      userId,
      'add'
    );
  }

  async getSongsFromPlaylist(playlistId) {
    // Playlist detail
    const playlistQuery = {
      text: `
        SELECT playlists.id, playlists.name, users.username 
        FROM playlists 
        LEFT JOIN users ON playlists.owner = users.id 
        WHERE playlists.id = $1
      `,
      values: [playlistId],
    };
    const playlistResult = await this._pool.query(playlistQuery);

    // Get songs
    const songsQuery = {
      text: `
        SELECT songs.id, songs.title, songs.performer 
        FROM playlist_songs 
        LEFT JOIN songs ON playlist_songs.song_id = songs.id 
        WHERE playlist_songs.playlist_id = $1
      `,
      values: [playlistId],
    };
    const songsResult = await this._pool.query(songsQuery);

    return {
      ...playlistResult.rows[0],
      songs: songsResult.rows,
    };
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan di playlist');
    }

    await this._playlistActivitiesService.addActivity(
      playlistId,
      songId,
      userId,
      'delete'
    );
  }
}

module.exports = PlaylistsService;
