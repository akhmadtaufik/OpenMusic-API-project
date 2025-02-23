const autoBind = require('auto-bind');

class LikesHandler {
  constructor(likesService, validator) {
    this._likesService = likesService;
    this._validator = validator;

    autoBind(this);
  }

  async postLikeHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    this._validator.validateAlbumId(albumId);
    await this._likesService.addLike(userId, albumId);

    return h
      .response({
        status: 'success',
        message: 'Album berhasil disukai',
      })
      .code(201);
  }

  async deleteLikeHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    this._validator.validateAlbumId(albumId);
    await this._likesService.deleteLike(userId, albumId);

    return h.response({
      status: 'success',
      message: 'Like berhasil dihapus',
    });
  }

  async getLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { cached, count } = await this._likesService.getLikesCount(albumId);

    const response = h.response({
      status: 'success',
      data: { likes: count },
    });

    if (cached) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }
}

module.exports = LikesHandler;
