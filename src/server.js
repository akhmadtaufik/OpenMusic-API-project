require('dotenv').config();
const Hapi = require('@hapi/hapi');
const process = require('process');

// Albums
const albums = require('./api/albums');
const AlbumsService = require('./service/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// Songs
const songs = require('./api/songs');
const SongsService = require('./service/SongsService');
const SongsValidator = require('./validator/songs');

// Users
const users = require('./api/users');
const UsersService = require('./service/UsersService');
const UsersValidator = require('./validator/users');

// Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./service/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// Exceptions
const ClientError = require('./exceptions/ClientError');
const AuthenticationError = require('./exceptions/AuthenticationError');
const ForbiddenError = require('./exceptions/ForbiddenError');

const init = async () => {
  const authenticationsService = new AuthenticationsService();
  const usersService = new UsersService();
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

  await server.register([
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
  ]);

  // Error handling with onPreResponse
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // Handle internal client errors
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // Handle authentication errors
      if (response instanceof AuthenticationError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(401);
        return newResponse;
      }

      // Handle forbidden errors
      if (response instanceof ForbiddenError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(403);
        return newResponse;
      }

      // Maintain native hapi client error handling, such as 404, etc
      if (!response.isServer) {
        return h.continue;
      }

      // Handle server errors according to needs
      const newResponse = h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      console.error(response);
      return newResponse;
    }

    // If not an error, continue with previous response (without intervention)
    return h.continue;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

// Handle unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
