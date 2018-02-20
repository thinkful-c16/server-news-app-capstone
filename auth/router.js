'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../config');
const router = express.Router();

const createAuthToken = function(user) {
  return jwt.sign({user}, JWT_SECRET, {
    subject: user.username,
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

router.use(bodyParser.json());

router.get('/auth/facebook', passport.authenticate('facebook'));
//the callback is where we store user details and redirect users
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  session: false,
  successRedirect: '/',
  failureRedirect: '/login'
}), (req, res) => {
  console.log('req.user in fb callback', req.user);
  res.json({
    token: req.user.accessToken
  });
}
);

module.exports = { router };