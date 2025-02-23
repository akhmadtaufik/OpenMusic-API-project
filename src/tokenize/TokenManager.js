const Jwt = require('@hapi/jwt');
const process = require('process');
const InvariantError = require('../exceptions/InvariantError');

const TokenManager = {
  generateAccessToken: (payload) => {
    if (!process.env.ACCESS_TOKEN_KEY) {
      throw new InvariantError('Access token key is not defined');
    }
    return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_AGE || '1800', // 30 minutes
    });
  },

  generateRefreshToken: (payload) => {
    if (!process.env.REFRESH_TOKEN_KEY) {
      throw new InvariantError('Refresh token key is not defined');
    }
    return Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY, {
      expiresIn: process.env.REFRESH_TOKEN_AGE || '604800', // 7 days
    });
  },

  verifyRefreshToken: (refreshToken) => {
    try {
      if (!process.env.REFRESH_TOKEN_KEY) {
        throw new InvariantError('Refresh token key is not defined');
      }
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Invalid refresh token');
    }
  },
};

module.exports = TokenManager;
