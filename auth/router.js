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

router.post('/facebook', (req, res) => {
  //check to see if token is valid
  const userToken = req.body.token;
  console.log('user token', userToken);
  fetch(`https://graph.facebook.com/debug_token?input_token=${userToken}&access_token=${FACEBOOK_APP_TOKEN}`)
    .then(response => response.json())
    .then(data => {
      // console.log('Data', data.data)
      const { user_id } = data.data;
      console.log('User id', user_id);
      fetch(`https://graph.facebook.com/${user_id}?access_token=${FACEBOOK_APP_TOKEN}&fields=id,first_name,last_name,email`)
        .then(response => response.json())
        .then(userData => console.log('User data', userData));
    });
  res.send('ok');
  // console.log(user_id);
  // let user;
  // return User.findOne({'facebook.id': user_id})
  //   .then(_user => {
  //     user = _user;
  //     if(!user) {
  //       User.create({
  //         name,
  //         email
  //       });
  //     }
  //     .then(user => {
  //       const authToken = createAuthToken(user.apiRepr());
  //       return res.status(201).json({authToken})
  //     })


  //need to query the profile for name and email, save the fb token to the db
  // fetch(`https://graph.facebook.com/${user_id}`)
  //   .then(response => response.json())
  //   .then(data => console.log(data));
        

        
    

  //check to see if fb id exists for a user in our database
  //if the user doesnt exist create the users
  //create the auth token and send back the auth token
  // res.json(req.body);
});

module.exports = { router };