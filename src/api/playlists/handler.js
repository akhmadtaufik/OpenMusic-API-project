const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({
      name,
      owner,
    });

    return h
      .response({
        status: 'success',
        data: { playlistId },
      })
      .code(201);
  }

  async getPlaylistsHandler(request) {
    const { id: owner } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(owner);

    return {
      status: 'success',
      data: { playlists },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, owner);
    await this._playlistsService.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistSongPayload(request.payload);

    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    // Verify song is exist
    await this._songsService.getSongById(songId);

    // Verify playlist access
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    // add song
    await this._playlistsService.addSongToPlaylist(playlistId, songId);

    return h
      .response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
      })
      .code(201);
  }

  async getSongsFromPlaylistHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    // Verify playlist access
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this._playlistsService.getSongsFromPlaylist(
      playlistId
    );

    return {
      status: 'success',
      data: { playlist },
    };
  }

  async deleteSongFromPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistSongPayload(request.payload);

    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    // Verify song is exist
    await this._songsService.getSongById(songId);

    // Verify playlist access
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    // Delete song
    await this._playlistsService.deleteSongFromPlaylist(playlistId, songId);

    return h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    });
  }
}

module.exports = PlaylistsHandler;
