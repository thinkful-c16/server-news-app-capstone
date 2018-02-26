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
  const newCollection = req.body;
  const userId = req.user.id;
  User.findOneAndUpdate(
    {'_id': userId}, 
    {$push: { collections: newCollection}}, 
    {upsert: true})
    .then(user => {
      res.status(201).json(user.collections);
    }).catch(err => res.status(err.code).json({message: 'Something went wrong'}));
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
  const article = req.body;
  User.findById(userId)
    .then(user => {
      const foundCollection = user.collections.find(collection => collection.id === collectionId);
      user.update( {collections: {'_id': foundCollection.id} },
        {$push: {'collectionArticles': article}});
      user.save();
      res.status(201).location(`/api/collections/${collectionId}`).json();
      // user.update(
      //   {$push: {correctCollection: {collectionArticles: article}
      //   }}); //user.collections.push
    
    }).catch(err => res.status(err.code).json({message: 'Something went wring'}));
});

module.exports = { router };