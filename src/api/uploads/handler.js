const autoBind = require('auto-bind');
const InvariantError = require('../../exceptions/InvariantError');

class UploadHandler {
  constructor(albumsService, storageService, validator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadCoverHandler(request, h) {
    const { id: albumId } = request.params;
    const { cover } = request.payload;
    this._validator.validateCoverHeaders(cover.hapi.headers);

    // Validate the file size (512KB)
    if (cover.bytes > 512000) {
      throw new InvariantError('Ukuran cover melebihi batas 512KB');
    }

    const coverUrl = await this._storageService.uploadCover(cover, {
      albumId,
      ext: cover.hapi.filename.split('.').pop(),
      headers: cover.hapi.headers,
    });

    await this._albumsService.addCoverUrl(albumId, coverUrl);

    return h
      .response({
        status: 'success',
        message: 'Cover berhasil diunggah',
      })
      .code(201);
  }
}

module.exports = UploadHandler;
