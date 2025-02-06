const Joi = require('joi');

const PostAuthenticationPayloadSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.base': 'username harus string',
    'string.empty': 'username tidak boleh kosong',
    'any.required': 'username wajib diisi',
  }),
  password: Joi.string().required().messages({
    'string.base': 'password harus string',
    'string.empty': 'password tidak boleh kosong',
    'any.required': 'password wajib diisi',
  }),
});

const PutAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.base': 'refresh token harus string',
    'string.empty': 'refresh token tidak boleh kosong',
    'any.required': 'refresh token wajib diisi',
  }),
});

const DeleteAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.base': 'refresh token harus string',
    'string.empty': 'refresh token tidak boleh kosong',
    'any.required': 'refresh token wajib diisi',
  }),
});

module.exports = {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
};
