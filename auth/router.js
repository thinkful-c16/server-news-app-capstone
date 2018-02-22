'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY, FACEBOOK_APP_TOKEN } = require('../config');
const router = express.Router();
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

//1.check to see if email matches an existing user, if it does, save the facebook information in that user's profile, return the auth token to the client
//2.check to see if facebook_id matches existing id, return auth token to client
//3.if no local user exists, create one, return auth token to client
//4. save fb token to facebook.token
router.post('/facebook', (req, res) => {
  //check to see if token is valid
  let user;
  const userToken = req.body.token;
  console.log('user token', userToken);
  fetch(`https://graph.facebook.com/debug_token?input_token=${userToken}&access_token=${FACEBOOK_APP_TOKEN}`)
    .then(response => response.json())
    .then(data => {
      const { user_id } = data.data;
      fetch(`https://graph.facebook.com/${user_id}?access_token=${FACEBOOK_APP_TOKEN}&fields=id,first_name,last_name,email`)
        .then(response => response.json())
        .then(userData => {
          // console.log('User data', userData)
          // User.find({'facebook.id': user_id} || {'email': userData.email})
          User.findOne({$or: [{'email': userData.email}, {'facebook.id': user_id}]})
            .then(_user => {
              user = _user;
              console.log('user after query', user);
              if (!user) {
                const { first_name, last_name, email } = userData;
                let name = {
                  firstName: first_name,
                  lastName: last_name
                };
                return User.create({
                  name,
                  email,
                  'facebook.id': user_id,
                  'facebook.token': userToken
                })
                  .then(user => console.log(user));
              }
              if(user) {
                user.email ? user.facebook.id = user_id : user.email = userData.email;
                user.facebook.token = userToken;
                console.log('user after assigning keys', user);
              }
              return user.save();      
            })
            .then(user => {
              const authToken = createAuthToken(user.apiRepr());
              console.log('user api repr', user.apiRepr());
              console.log('our auth token', authToken);
              return res.json({authToken}); 
            });
        });
    });
});

module.exports = { router };