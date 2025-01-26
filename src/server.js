/* eslint-disable no-undef */
const Hapi = require('@hapi/hapi');
const apiPlugin = require('./api');
const AlbumsService = require('./service/AlbumsService');
const SongsService = require('./service/SongsService');
const ClientError = require('./exceptions/ClientError');
const NotFoundError = require('./exceptions/NotFoundError');
const InvariantError = require('./exceptions/InvariantError');
const { AlbumsValidator, SongsValidator } = require('./validator');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();

  const server = Hapi.server({
    port: 3000,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: apiPlugin,
    options: {
      albumsService,
      songsService,
      albumsValidator: AlbumsValidator,
      songsValidator: SongsValidator,
    },
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (response instanceof NotFoundError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(404);
      return newResponse;
    }

    if (response instanceof InvariantError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(400);
      return newResponse;
    }

    if (response.isBoom) {
      const newResponse = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
      newResponse.code(response.output.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
