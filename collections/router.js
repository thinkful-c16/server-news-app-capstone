'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('../users/model');
const router = express.Router();
const jsonParser = bodyParser.json();
const passport = require('passport');
const { collection1, collection2, } = require('./dummy-data');


const jwtAuth = passport.authenticate('jwt', { session: false })

router.use(jsonParser);

router.get('/', jwtAuth, (req, res) => {
    const user = req.user;
    // console.log('this is the user', user);
    User.findById(user.id)
        .then(_user => {
            // console.log('this is user collections inside promise', _user.collections)
            return _user.collections
        })
        .catch(err => {
            res.status(500).json({
                message: 'Internal Server Error'
            });
        });
    res.send('ok')
})

router.post('/', jwtAuth, (req, res) => {
    const userId = req.user.id;
    User.findById(userId)
      .then(user => {
        console.log(user)
        user.collections = collection2;
        user.save();
        console.log('User after new collection', user);
      });
    res.send('ok');
  });

router.put('/:collections', jwtAuth, (req, res) => {
    const collectionId = req.params.collections;
    const user = req.user;    
    
    if(!(collectionId && req.body.id === req.body.id)){
        res.status(400).json({
          error: 'Request path ID and request body ID must match'
        });
      }

    const updated = {};
    const updatableFields = ['title']
    updatableFields.forEach(field => {
        if(field in req.body){
            udated[field] = req.body[field]
        }
    })
    
    console.log('req.params.id', collectionId)
    
    User.findByIdAndUpdate(collectionId, {$set: updated}, {new: true})
        .then(updatedCollection => {
            console.log(_user.collections)
            res.status(201).json(updatedCollection);
        })
        .catch(err => {
            res.status(500).json({message: 'Something went wrong!'})
        })
})

router.delete('/:collections/:id', jwtAuth, (req, res) => {
    User.update(
        {_id: req.params.collections},
        { $pull: { 'collections':{_id: req.params.id} } }
    )
        .then(result => {
            res.status(204).end();
        })
})

module.exports = { router };