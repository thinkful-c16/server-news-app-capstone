'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('../users/model');
const router = express.Router();
const jsonParser = bodyParser.json();
const passport = require('passport');
// const faker = require('faker');
// const { col1, col2, } = require('./data');



router.use(jsonParser);


const jwtAuth = passport.authenticate('jwt', { session: false });

router.post('/', jwtAuth, (req, res) => {
  const newCollection = req.body;
  const userId = req.user.id;
  User.findOneAndUpdate(
    {'_id': userId}, 
    {$push: { collections: newCollection}}, 
    {upsert: true, new: true})
    .then(user => {
      res.status(201).json(user.collections[user.collections.length-1]);
    }).catch(err => res.status(err.code).json({message: 'Something went wrong'}));
});
//adding articles to the first collection every time
router.post('/:collection', jwtAuth, (req, res) => {
  const collectionId = req.params.collection;
  const userId = req.user.id;
  const article = req.body;
  User.findOneAndUpdate(
    {'_id': userId, 'collections._id': collectionId},
    {$push: {'collections.$.collectionArticles': article }},
    {upsert: true, new: true})
    .then(user => {
      res.status(201).location(`/api/collections/${collectionId}`).json(user.collections.find(collection => {
        return collection._id === collectionId;
      }));
    }).catch(err => res.status(err.code).json({message: 'Something went wrong'}));
});

module.exports = { router };