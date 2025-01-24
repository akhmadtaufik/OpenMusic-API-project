/* eslint-disable no-undef */
const Hapi = require('@hapi/hapi');
const apiPlugin = require('./api');
const AlbumsService = require('./service/AlbumsService');
const SongsService = require('./service/SongsService');

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
    },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
