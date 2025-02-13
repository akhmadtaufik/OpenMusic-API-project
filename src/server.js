require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
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

// Playlist
const playlists = require('./api/playlists');
const PlaylistsService = require('./service/PlaylistsService');
const PlaylistActivitiesService = require('./service/PlaylistActivitiesService');
const PlaylistsValidator = require('./validator/playlists');

// Collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./service/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// Message Broker
const exportsAPI = require('./api/exports');
const ProducerService = require('./service/rabbitmq/ProducerService');
const MailSender = require('./service/rabbitmq/MailSender');
const ConsumerService = require('./service/rabbitmq/ConsumerService');
const ExportsValidator = require('./validator/exports');

// Exceptions
const ClientError = require('./exceptions/ClientError');
const AuthenticationError = require('./exceptions/AuthenticationError');
const ForbiddenError = require('./exceptions/ForbiddenError');

const init = async () => {
  const authenticationsService = new AuthenticationsService();
  const usersService = new UsersService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const collaborationsService = new CollaborationsService();
  const playlistActivitiesService = new PlaylistActivitiesService();
  const playlistsService = new PlaylistsService(
    collaborationsService,
    playlistActivitiesService
  );
  const producerService = new ProducerService();
  const mailSender = new MailSender();
  const consumerService = new ConsumerService(playlistsService, mailSender);

  consumerService.consume('export:playlists').catch(console.error);

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
      plugin: Jwt,
    },
  ]);

  // Define JWT authentication strategy
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
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
    {
      plugin: playlists,
      options: {
        playlistsService,
        songsService,
        playlistActivitiesService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: exportsAPI,
      options: {
        producerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
  ]);

  // Error handling with onPreResponse
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    // Jika bukan error, lanjutkan response normal
    if (!response.isBoom && !(response instanceof Error)) {
      return h.continue;
    }

    // 1. Handle 400 Bad Request
    if (response instanceof ClientError) {
      return h
        .response({
          status: 'fail',
          message: response.message,
        })
        .code(response.statusCode);
    }

    // 2. Handle 401 Unauthorized
    if (response instanceof AuthenticationError) {
      return h
        .response({
          status: 'fail',
          message: response.message,
        })
        .code(401);
    }

    // 3. Handle 403 Forbidden
    if (response instanceof ForbiddenError) {
      return h
        .response({
          status: 'fail',
          message: response.message,
        })
        .code(403);
    }

    // 4. Handle 404 Not Found
    if (response.output?.statusCode === 404) {
      return h
        .response({
          status: 'fail',
          message: 'Resource tidak ditemukan',
        })
        .code(404);
    }

    // Handle 400 Bad Request (e.g., duplicate entry)
    if (response.code === '23505') {
      // Error code untuk unique violation
      return h
        .response({
          status: 'fail',
          message: 'Lagu sudah ada di playlist',
        })
        .code(400);
    }

    // Handle Foreign Key Violation (user/playlist tidak ada)
    if (response.code === '23503') {
      const detail = response.detail || '';
      let message = 'Relasi tidak valid';
      if (detail.includes('user_id')) message = 'User tidak ditemukan';
      if (detail.includes('playlist_id')) message = 'Playlist tidak ditemukan';

      return h
        .response({
          status: 'fail',
          message,
        })
        .code(404);
    }

    // 5. Handle native Hapi client errors
    if (!response.isServer) {
      return h
        .response({
          status: 'fail',
          message: response.message || 'Bad Request',
        })
        .code(response.output.statusCode);
    }

    // 6. Handle 500 Server Error
    console.error(response);
    return h
      .response({
        status: 'error',
        message: 'Terjadi kegagalan pada server kami',
      })
      .code(500);
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
