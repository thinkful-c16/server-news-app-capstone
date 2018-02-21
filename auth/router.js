'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY, FACEBOOK_APP_TOKEN } = require('../config');
const router = express.Router();

router.use(bodyParser.json());

const createAuthToken = function(user) {
  return jwt.sign({user}, JWT_SECRET, {
    subject: user.email,
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

const localAuth = passport.authenticate('local', {session: false});

router.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user.apiRepr());
  res.json({authToken});
});

const jwtAuth = passport.authenticate('jwt', {session: false});

router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({authToken});
});

router.post('/facebook', (req, res) => {
  //check to see if token is valid
  const userToken = req.body.token;
  fetch(`https://graph.facebook.com/debug_token?input_token=${userToken}&access_token=${FACEBOOK_APP_TOKEN}`)
    .then(response => response.json())
    .then(data => console.log(data));
  res.json(req.body);
});

module.exports = { router };