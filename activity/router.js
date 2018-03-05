'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('../users/model');
const { Activity, activityOptions } = require('./model');
const router = express.Router();
const jsonParser = bodyParser.json();
const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', { session: false });

router.use(jsonParser); 

router.get('/', jwtAuth, (req, res) => {
  Activity.find()
    .then(activities => res.json(activities))
    .catch(err => res.status(500).json({message: 'Something went wrong'}));
});

router.post('/', jwtAuth, (req, res) => {
  console.log('logging new share activity', req.body);

  // Activity
  //   .create({
  //     owner: req.user.id,
  //     activityType: activityOptions.SHARE_ARTICLE,
  //     data: req.body.article,
  //     channel: req.channel
  //   })
  //   .then(activity =>{
  //     // console.log(activity);
  //     res.status(201).json(activity);
  //   })
  //   .catch(err => {
  //     console.error(err);
  //     res.status(500).json({error: 'something went wrong'});
  //   });

});

module.exports = { router };