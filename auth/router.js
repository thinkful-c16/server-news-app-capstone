'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../config');
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

router.get('/facebook', passport.authenticate('facebook'));
//the callback is where we store user details and redirect users
router.get('/facebook/callback', passport.authenticate('facebook', {
  session: false,
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect('/');
  console.log('req.user in fb callback', req.user);
  // res.json({
  //   token: req.user.accessToken
  // });
}
);

module.exports = { router };