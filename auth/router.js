'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY, FACEBOOK_APP_TOKEN, GOOGLE_CLIENT_ID } = require('../config');
const router = express.Router();
const GoogleAuth = require('google-auth-library');

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


router.post('/google', (req, res) => {
  const userToken = req.body.token;
  fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${userToken}`)
    .then(response => response.json())
    .then(data => console.log(data.email, data.name, data.given_name, data.family_name, data.picture))
    .then(
      User.findOne({''})
    )
  res.json(req.body);
});

module.exports = { router };