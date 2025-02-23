const { AlbumIdSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const LikesValidator = {
  validateAlbumId: (params) => {
    const validationResult = AlbumIdSchema.validate(params);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = LikesValidator;
