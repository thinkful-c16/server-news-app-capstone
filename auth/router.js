'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const router = express.Router();


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