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

router.post('/', jwtAuth, (req, res) => {

    const requiredFields = ['owner', 'activityType'];
    for (let i=0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (!(field in req.body)) {
        const message = `Missing \`${field}\` in request body`;
        console.error(message);
        return res.status(400).send(message);
      }
    }

    Activity
    .create({
      owner: req.user.id,
      activityType: req.body.activityType,
      date: req.body.date
    })
    .then(activity =>{
      console.log(activity);
      res.status(201).json(activity);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    });

})

module.exports = { router };