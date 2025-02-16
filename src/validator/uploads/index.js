const { UploadCoverSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const UploadsValidator = {
  validateCoverHeaders: (headers) => {
    const validationResult = UploadCoverSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError('Format cover tidak valid');
    }
  },
};

module.exports = UploadsValidator;
