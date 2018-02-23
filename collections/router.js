'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('../users/model');
const router = express.Router();
const jsonParser = bodyParser.json();
const passport = require('passport');

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

module.exports = { router };