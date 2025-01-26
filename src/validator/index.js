const { albumPayloadSchema, songPayloadSchema } = require('./schema');
const InvariantError = require('../exceptions/InvariantError');

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = albumPayloadSchema.validate(payload);
    if (validationResult.error) {
      console.error('Validation Error:', validationResult.error.details); // Debugging log
      throw new InvariantError(validationResult.error.message);
    }
  },
};

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = songPayloadSchema.validate(payload);
    if (validationResult.error) {
      console.error('Validation Error:', validationResult.error.details); // Debugging log
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = { AlbumsValidator, SongsValidator };
