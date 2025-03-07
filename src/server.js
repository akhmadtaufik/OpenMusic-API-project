require("dotenv").config();
const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const Inert = require("@hapi/inert");
const process = require("process");

// Albums
const albums = require("./api/albums");
const AlbumsService = require("./service/AlbumsService");
const AlbumsValidator = require("./validator/albums");

// Songs
const songs = require("./api/songs");
const SongsService = require("./service/SongsService");
const SongsValidator = require("./validator/songs");

// Users
const users = require("./api/users");
const UsersService = require("./service/UsersService");
const UsersValidator = require("./validator/users");

// Authentications
const authentications = require("./api/authentications");
const AuthenticationsService = require("./service/AuthenticationsService");
const TokenManager = require("./tokenize/TokenManager");
const AuthenticationsValidator = require("./validator/authentications");

// Playlist
const playlists = require("./api/playlists");
const PlaylistsService = require("./service/PlaylistsService");
const PlaylistActivitiesService = require("./service/PlaylistActivitiesService");
const PlaylistsValidator = require("./validator/playlists");

// Collaborations
const collaborations = require("./api/collaborations");
const CollaborationsService = require("./service/CollaborationsService");
const CollaborationsValidator = require("./validator/collaborations");

// Message Broker
const exportsAPI = require("./api/exports");
const ProducerService = require("./service/rabbitmq/ProducerService");
const ExportsValidator = require("./validator/exports");

// Uploads
const uploads = require("./api/uploads");
// const StorageService = require("./service/minio/StorageService");
const StorageService = require("./service/S3/StorageService");
const UploadsValidator = require("./validator/uploads");

// Likes
const likes = require("./api/likes");
const UserAlbumLikesService = require("./service/UserAlbumLikesService");
const LikesValidator = require("./validator/likes");

// Cache
const CacheService = require("./service/redis/CacheService");

// Exceptions
const ClientError = require("./exceptions/ClientError");
const AuthenticationError = require("./exceptions/AuthenticationError");
const ForbiddenError = require("./exceptions/ForbiddenError");

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
  const storageService = new StorageService();
  const cacheService = new CacheService();
  const userAlbumLikesService = new UserAlbumLikesService(cacheService);

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || "localhost",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // Define JWT authentication strategy
  server.auth.strategy("openmusic_jwt", "jwt", {
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
    {
      plugin: uploads,
      options: {
        albumsService,
        storageService,
        validator: UploadsValidator,
      },
    },
    {
      plugin: likes,
      options: {
        likesService: userAlbumLikesService,
        validator: LikesValidator,
      },
    },
  ]);

  // Error handling with onPreResponse
  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    // Jika bukan error, lanjutkan response normal
    if (!response.isBoom && !(response instanceof Error)) {
      return h.continue;
    }

    // 1. Handle 400 Bad Request
    if (response instanceof ClientError) {
      return h
        .response({
          status: "fail",
          message: response.message,
        })
        .code(response.statusCode);
    }

    // 2. Handle 401 Unauthorized
    if (response instanceof AuthenticationError) {
      return h
        .response({
          status: "fail",
          message: response.message,
        })
        .code(401);
    }

    // 3. Handle 403 Forbidden
    if (response instanceof ForbiddenError) {
      return h
        .response({
          status: "fail",
          message: response.message,
        })
        .code(403);
    }

    // 4. Handle 404 Not Found
    if (response.output?.statusCode === 404) {
      return h
        .response({
          status: "fail",
          message: "Resource tidak ditemukan",
        })
        .code(404);
    }

    // 5. Handle 400 Bad Request
    if (response.code === "23505") {
      // Error code untuk unique violation
      return h
        .response({
          status: "fail",
          message: "Lagu sudah ada di playlist",
        })
        .code(400);
    }

    // 6. Handle Foreign Key Violation (user/playlist tidak ada)
    if (response.code === "23503") {
      const detail = response.detail || "";
      let message = "Relasi tidak valid";
      if (detail.includes("user_id")) message = "User tidak ditemukan";
      if (detail.includes("playlist_id")) message = "Playlist tidak ditemukan";

      return h
        .response({
          status: "fail",
          message,
        })
        .code(404);
    }

    // 7. Handle error payload too large (413)
    if (response.output?.statusCode === 413) {
      return h
        .response({
          status: "fail",
          message: "Ukuran cover melebihi batas 512KB",
        })
        .code(413);
    }

    // 8. Handle Hapi's native 415 (Unsupported Media Type)
    if (response.output?.statusCode === 415) {
      return h
        .response({
          status: "fail",
          message: "Format cover tidak valid",
        })
        .code(400);
    }

    // 9. Handle error Redis
    if (response.message && response.message.includes("Redis")) {
      console.error("Redis error:", response);
      return h
        .response({
          status: "fail",
          message: "Terjadi masalah pada cache, tetapi operasi utama berhasil",
        })
        .code(207);
    }

    // 10. Handle native Hapi client errors
    if (!response.isServer) {
      return h
        .response({
          status: "fail",
          message: response.message || "Bad Request",
        })
        .code(response.output.statusCode);
    }

    // 11. Handle 500 Server Error
    console.error(response);
    return h
      .response({
        status: "error",
        message: "Terjadi kegagalan pada server kami",
      })
      .code(500);
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

// Handle unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});

init();
