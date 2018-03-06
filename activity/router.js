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
    .catch(() => res.status(500).json({message: 'Something went wrong'}));
});

router.post('/', jwtAuth, (req, res) => {
  let userId = req.user.id;
  User.findOne(
    {'_id': userId}
  )
    .then((user) => {
      Activity
        .create({
          owner: userId,
          activityType: activityOptions.SHARE_ARTICLE,
          data: {
            user: user.name,
            articleTitle: req.body.data1.title,
            articleImage: req.body.data1.image,
            articleUrl: req.body.data1.url,
            articleSource: req.body.data1.source.name
          },
          channel: req.body.data2
        })
        .then(activity =>{
          res.status(201).json(activity);
        })
        .catch(() => {
          res.status(500).json({error: 'something went wrong'});
        });
    }
    );
});

module.exports = { router };