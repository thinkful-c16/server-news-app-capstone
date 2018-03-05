'use strict';

const { router } = require('./router');
const { localStrategy, jwtStrategy } = require('./strategies/local');

module.exports = { router, localStrategy, jwtStrategy };