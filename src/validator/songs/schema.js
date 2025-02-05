const Joi = require('joi');

const songPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().integer().min(0).optional(),
  albumId: Joi.string().optional(),
});

module.exports = { songPayloadSchema };
