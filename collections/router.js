'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('../users/model');
const router = express.Router();
const jsonParser = bodyParser.json();
const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', { session: false });

router.use(jsonParser);

router.get('/', jwtAuth, (req, res) => {
  console.log(req.user);
  const userId = req.user.id;
  User.findById(userId)
    .then(user => {
      console.log(user);
      res.status(200).json(user.collections);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: 'Internal Server Error'
      });
    });
});

router.get('/:collection', jwtAuth, (req, res) => {
  const userId = req.user.id;
  const collectionId = req.params.collection;
  User.findById(userId)
    .then(user => {
      const foundCollection = user.collections.find(collection => collection.id === collectionId);
      res.status(200).json(foundCollection);
    });
});

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
    }).catch(err => {
      console.log(err);
      res.status(500).json({message: 'Something went wrong'});
    });
});

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
        const foundCollection = collection._id.toString() === collectionId;
        return foundCollection;
      }));
    }).catch(err => {
      console.log(err);
      res.status(500).json({message: 'Something went wrong'}
      );
  });
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
    {$set: {'collections.$.collectionTitle': updated.collectionTitle}}, 
    {upsert: true, new: true})
    .then(user => {
    //   console.log(user);
      console.log('UPDATED FIELD>>>>', updated);
      res.status(201).json();
    })
    .catch(err => {
      res.status(500).json(
        console.log(err),
        {message: 'Something went wrong!'}
      );
    });
});

router.delete('/:collection', jwtAuth, (req, res) => {
    console.log(req.params.collection)
    console.log(req.user.id)
  User.update(
    {_id: req.user.id},
    { "$pull": { 'collections': { _id: req.params.collection } } }
  )
    .then(result => {
      res.status(204).send();
    })
    .catch(err => {
      res.status(500).json({message: 'Something went wrong and your collection was not deleted'})
    });
    }).catch(err => res.status(err.code).json({message: 'Something went wrong'}));
});

module.exports = { router };