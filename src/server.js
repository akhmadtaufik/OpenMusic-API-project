/* eslint-disable no-undef */
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const apiPlugin = require('./api');
const AlbumsService = require('./service/AlbumsService');
const SongsService = require('./service/SongsService');
const { AlbumsValidator, SongsValidator } = require('./validator');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
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

    // Penanganan error jika merupakan instance ClientError
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    // Penanganan error lainnya (bukan ClientError)
    if (response.isBoom) {
      const newResponse = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
      newResponse.code(response.output.statusCode);
      return newResponse;
    }

    // Melanjutkan response tanpa modifikasi jika tidak ada error
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
