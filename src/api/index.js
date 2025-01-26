const { AlbumsHandler, SongsHandler } = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'api',
  version: '1.0.0',
  register: async (
    server,
    { albumsService, songsService, albumsValidator, songsValidator }
  ) => {
    const albumsHandler = new AlbumsHandler(albumsService, albumsValidator);
    const songsHandler = new SongsHandler(songsService, songsValidator);

    server.route(routes(albumsHandler, songsHandler));
  },
};
