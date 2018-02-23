'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('../users/model');
const router = express.Router();
const jsonParser = bodyParser.json();
const passport = require('passport');
const faker = require('faker');
const { col1, col2, } = require('./data');



router.use(jsonParser);


const jwtAuth = passport.authenticate('jwt', { session: false });

//post an article to a specific collection via id
//

router.post('/', jwtAuth, (req, res) => {
  const user = req.user;
  console.log(user);
  User.findById(user.id)
    .then(user => {
      console.log(user)
      user.collections = col1;
      user.save();
      console.log('User after new collection', user)
    });
  res.send('ok');
});

module.exports = { router };