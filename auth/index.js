'use strict';

const { router } = require('./router');
const { localStrategy, jwtStrategy } = require('./strategies/local');
const { facebookStrategy } = require('./strategies/facebook');

module.exports = { router, localStrategy, jwtStrategy, facebookStrategy };