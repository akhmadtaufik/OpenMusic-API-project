const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    // Validasi payload
    this._validator.validatePostExportPayload(request.payload);

    // Verify playlist ownerhip
    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);

    const { targetEmail } = request.payload;
    const message = { playlistId, targetEmail };

    // Send to rabbitmq
    await this._producerService.sendMessage('export:playlists', message);

    return h
      .response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      })
      .code(201);
  }
}

module.exports = ExportsHandler;
