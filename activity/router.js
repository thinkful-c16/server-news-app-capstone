'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { Activity } = require('../activity/model');
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

module.exports = { router };