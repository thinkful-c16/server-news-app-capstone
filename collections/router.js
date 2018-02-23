'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('../users/model');
const router = express.Router();
const jsonParser = bodyParser.json();
const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', { session: false });

router.post('/:collection', jwtAuth, (req, res) => {
  res.send('ok');
});

module.exports = { router };