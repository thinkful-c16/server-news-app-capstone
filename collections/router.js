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

//post a collection to the user record
//find the user by id
//destructure the collection title from the collection object
//return the collection id and location to the user

router.post('/', jwtAuth, (req, res) => {
  const userId = req.user.id;
  // console.log(user);
  User.findById(userId)
    .then(user => {
      console.log(user)
      user.collections = col1;
      user.save();
      console.log('User after new collection', user);
    });
  res.send('ok');
});

//article from the client is an object
//use params to get collection id
//find the user by id
//find the collection by id
//destructure the article object
//save the article props to the collection
router.post('/:collections', jwtAuth, (req, res) => {
  const collectionId = req.params.id;
  const userId = req.user.id;

});

module.exports = { router };