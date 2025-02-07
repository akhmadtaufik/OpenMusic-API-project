const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Nama playlist harus berupa string',
    'any.required': 'Nama playlist wajib diisi',
  }),
});

const PostPlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required().messages({
    'string.base': 'ID lagu harus berupa string',
    'any.required': 'ID lagu wajib diisi',
  }),
});

module.exports = {
  PostPlaylistPayloadSchema,
  PostPlaylistSongPayloadSchema,
};
