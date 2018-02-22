'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY, FACEBOOK_APP_TOKEN, GOOGLE_CLIENT_ID } = require('../config');
const router = express.Router();
const GoogleAuth = require('google-auth-library');
const { User } = require('../users');

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
  let user;
  const userToken = req.body.token;
  fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${userToken}`)
    .then(response => response.json())
    .then(data => {
      const { sub, email } = data
      User.findOne({ $or: [{'email': email}, {'google.id': sub}] })
        .then(_user => {
          user = _user;
          if(!user){
            const { firstName, lastName } = user.name;
            const { email } = user;
            let name = {
              firstName: firstName,
              lastName: lastName
            }
            return User.create({
              name,
              email,
              'google.id': sub,
              'google.token': userToken
            })
            .then(user => {
              const authToken = createAuthToken(user.apiRepr());
              return res.status(201).location(`/api/auth/${user.id}`.json({authToken}))
            })
          }
          if(user){
            user.email ? user.google.id = sub : user.email = user.email;
            user.google.token = userToken;
          }
          return user.save();
        })
        .then(user => {
          const authToken = createAuthToken(user.apiRepr());
          return res.json({authToken}); 
        })
    })
});

module.exports = { router };