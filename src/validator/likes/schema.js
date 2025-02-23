const Joi = require('joi');

const AlbumIdSchema = Joi.string().required();

module.exports = { AlbumIdSchema };
