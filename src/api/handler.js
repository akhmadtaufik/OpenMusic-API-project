const ClientError = require('../exceptions/ClientError');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { name, year } = request.payload;

      const albumId = await this._service.addAlbum({ name, year });

      return h
        .response({
          status: 'success',
          data: { albumId },
        })
        .code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(400);
      }

      return h
        .response({
          status: 'error',
          message: 'Server error occurred',
        })
        .code(500);
    }
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this._service.getAlbumById(id);

      return {
        status: 'success',
        data: { album },
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        return h
          .response({
            status: 'fail',
            message: 'Album tidak ditemukan',
          })
          .code(404);
      }

      return h
        .response({
          status: 'error',
          message: 'Server error occurred',
        })
        .code(500);
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;
      const { name, year } = request.payload;

      await this._service.editAlbumById(id, { name, year });

      return {
        status: 'success',
        message: 'Album berhasil diperbaharui',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(400);
      }

      return h
        .response({
          status: 'error',
          message: 'Server error occurred',
        })
        .code(500);
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteAlbumById(id);

      return {
        status: 'success',
        message: 'Album berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        return h
          .response({
            status: 'fail',
            message: 'Album tidak ditemukan',
          })
          .code(404);
      }

      return h
        .response({
          status: 'error',
          message: 'Server error occurred',
        })
        .code(500);
    }
  }
}

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload); // Validasi payload
      const { title, year, genre, performer, duration, albumId } =
        request.payload;

      const songId = await this._service.addSong({
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
      });

      return h
        .response({
          status: 'success',
          data: { songId },
        })
        .code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(400); // Mengembalikan 400 untuk error validasi
      }

      // Error lainnya
      return h
        .response({
          status: 'error',
          message: 'Server error occurred',
        })
        .code(500);
    }
  }

  async getAllSongsHandler(request) {
    const { title, performer } = request.query;
    const songs = await this._service.getSongs(title, performer);

    return {
      status: 'success',
      data: { songs },
    };
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._service.getSongById(id);

      return {
        status: 'success',
        data: { song },
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        return h
          .response({
            status: 'fail',
            message: 'Lagu tidak ditemukan',
          })
          .code(404);
      }

      return h
        .response({
          status: 'error',
          message: 'Server error occurred',
        })
        .code(500);
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { id } = request.params;
      const { title, year, genre, performer, duration, albumId } =
        request.payload;

      await this._service.editSongById(id, {
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
      });

      return {
        status: 'success',
        message: 'Lagu berhasil diperbaharui',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(400);
      }

      return h
        .response({
          status: 'error',
          message: 'Server error occurred',
        })
        .code(500);
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteSongById(id);

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        return h
          .response({
            status: 'fail',
            message: 'Lagu tidak ditemukan',
          })
          .code(404);
      }

      return h
        .response({
          status: 'error',
          message: 'Server error occurred',
        })
        .code(500);
    }
  }
}

module.exports = { AlbumsHandler, SongsHandler };
