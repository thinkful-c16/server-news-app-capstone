'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('../users/model');
const router = express.Router();
const jsonParser = bodyParser.json();
const passport = require('passport');
const { collection1, collection2, } = require('./dummy-data');


const jwtAuth = passport.authenticate('jwt', { session: false });

router.use(jsonParser);

router.get('/', jwtAuth, (req, res) => {
  const user = req.user;
  // console.log('this is the user', user);
  User.findById(user.id)
    .then(_user => {
      // console.log('this is user collections inside promise', _user.collections)
      res.status(200).json(_user.collections);
    })
    .catch(err => {
      res.status(500).json({
        message: 'Internal Server Error'
      });
    });
//   res.send('ok');
});

router.post('/', jwtAuth, (req, res) => {
  const newCollection = req.body;
  const userId = req.user.id;
  User.findOneAndUpdate(
    {'_id': userId}, 
    {$push: { collections: newCollection}}, 
    {upsert: true, new: true})
    .then(user => {
      res.status(201).json(user.collections[user.collections.length-1]);
    }).catch(err => {
        console.log(err)
      res.status(500).json({message: 'Something went wrong'})
    });
});

router.post('/:collection', jwtAuth, (req, res) => {
  const collectionId = req.params.collection;
  const userId = req.user.id;
  const article = req.body;
  User.findOneAndUpdate(
    {'_id': userId, 'collections._id': collectionId},
    {$push: {'collections.collectionArticles': article }},
    {upsert: true, new: true})
    .then(user => {
      res.status(201).location(`/api/collections/${collectionId}`).json(user.collections.find(collection => {
        const foundCollection = collection._id.toString() === collectionId;
        return foundCollection;
      }));
    }).catch(err => {
      console.log(err)
      res.status(500).json({message: 'Something went wrong'}
      
      );});
});

router.put('/:collections', jwtAuth, (req, res) => {
  const collectionId = req.params.collections;
  const userId = req.user.id;    
    
  if(!(collectionId && req.body.id === req.body.id)){
    res.status(400).json({
      error: 'Request path ID and request body ID must match'
    });
  }

  const updated = {};
  const updatableFields = ['collectionTitle'];
  updatableFields.forEach(field => {
    if(field in req.body){
      updated[field] = req.body[field];
    }
  });
    
  console.log('req.params.id', collectionId);

  User.findOneAndUpdate(
    {'_id': userId, 'collections._id': collectionId}, 
    {$set: {'collections.$': updated}}, 
    {upsert: true, new: true})
    .then(user => {
      console.log(user);
      console.log('UPDATED FIELD>>>>', updated)
      res.status(201).json();
    })
    .catch(err => {
      res.status(500).json(
        console.log(err),
        {message: 'Something went wrong!'}
      );
    });
});

router.delete('/:collections/:id', jwtAuth, (req, res) => {
  User.update(
    {_id: req.params.collections},
    { $pull: { 'collections':{_id: req.params.id} } }
  )
    .then(result => {
      res.status(204).end();
    });
});

module.exports = { router };