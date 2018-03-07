'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('../users/model');
const { Activity, activityOptions } = require('../activity/model');
const router = express.Router();
const jsonParser = bodyParser.json();
const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', { session: false });

router.use(jsonParser);

router.get('/', jwtAuth, (req, res) => {
  const userId = req.user.id;
  User.findById(userId)
    .then(user => {
      res.status(200).json(user.collections);
    })
    .catch(() => {
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

router.post('/', jwtAuth, (req, res) => {
  const newCollection = req.body;
  const userId = req.user.id;
  User.findByIdAndUpdate(
    userId, 
    {$push: { collections: newCollection}}, 
    {upsert: true, new: true})
    .then(user => {
      res.status(201).json(user.collections[user.collections.length-1]);
      return Activity.create({
        owner: userId, 
        activityType: activityOptions.NEW_COLLECTION, 
        data: {
          username: user.name,
          collectionTitle: newCollection.collectionTitle}});
    })
    .catch(()=> {
      res.status(500).json({message: 'Something went wrong'});
    });
});

router.post('/:collection', jwtAuth, (req, res) => {
  const collectionId = req.params.collection;
  const userId = req.user.id;
  const article = req.body;
  let foundCollection;

  User.findOneAndUpdate(
    {'_id': userId, 'collections._id': collectionId},
    {$push: {'collections.$.collectionArticles': article }},
    {upsert: true, new: true})
    .then(user => {
      foundCollection = user.collections.find(collection => {
        return collection._id.toString() === collectionId;
      });
      return Activity.create({
        owner: userId,
        activityType: activityOptions.NEW_COLLECTION_ARTICLE,
        data: {
          username: user.name,
          collectionTitle: foundCollection.collectionTitle,
          articleTitle: article.title
        }
      }).then(() => {
        res.status(201).location(`/api/collections/${collectionId}`).json(foundCollection);
      });
    }).catch(() => {
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
    
  User.findOneAndUpdate(
    {'_id': userId, 'collections._id': collectionId}, 
    {$set: {'collections.$.collectionTitle': updated.collectionTitle}}, 
    {upsert: true, new: true})
    .then(() => {
      res.status(201).json();
    })
    .catch(() => {
      res.status(500).json(
        {message: 'Something went wrong!'}
      );
    });
});

router.delete('/:collection', jwtAuth, (req, res) => {
  User.update(
    {_id: req.user.id},
    { '$pull': { 'collections': { _id: req.params.collection } } }
  )
    .then(() => {
      res.status(204).send();
    })
    .catch(() => {
      res.status(500).json({message: 'Something went wrong and your collection was not deleted'});
    });
});

router.delete('/:collection/:article', jwtAuth, (req, res) => {
  const collectionId = req.params.collection;
  const articleId = req.params.article;
  const userId = req.user.id;
  User.findOneAndUpdate(
    {_id : userId, 'collections._id': collectionId},
    { '$pull': { 'collections.$.collectionArticles': { _id : articleId } } }
  )
    .then(() => {
      res.status(204).send();
    })
    .catch(() => {
      res.status(500).json({message: 'Something went wrong and the article was not deleted from your collection'});
    });
});

module.exports = { router };