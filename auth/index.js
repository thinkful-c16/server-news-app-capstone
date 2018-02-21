'use strict';

const { router } = require('./router');
const { localStrategy, jwtStrategy } = require('./strategies/local');
const { facebookStrategy } = require('./strategies/facebook');
const { googleStrategy } = require('./strategies/google')

module.exports = { router, localStrategy, jwtStrategy, facebookStrategy, googleStrategy };