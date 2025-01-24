const { AlbumsHandler, SongsHandler } = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'api',
  version: '1.0.0',
  register: async (server, { albumsService, songsService }) => {
    const albumsHandler = new AlbumsHandler(albumsService);
    const songsHandler = new SongsHandler(songsService);

    server.route(routes(albumsHandler, songsHandler));
  },
};
