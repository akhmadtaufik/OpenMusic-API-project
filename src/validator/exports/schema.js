const Joi = require('joi');

const PostExportPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email().required(),
});

module.exports = { PostExportPlaylistPayloadSchema };
