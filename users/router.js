'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('./model');
const router = express.Router();
const jsonParser = bodyParser.json();

router.post('/', jsonParser, (req, res ) => {
  const requiredFields = ['email', 'password', 'name'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }
  const { firstName, lastName } = req.body.name;
  const stringFields = ['email', 'password', firstName, lastName ];
  const nonStringField = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');
  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Expected string',
      location: nonStringField
    });
  }
  const trimmedFields = ['email', 'password'];
  const nonTrimmedField = trimmedFields.find(field => req.body[field].trim() !== req.body[field]);
  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }
  const sizedFields = {
    password: { min: 10, max: 72 }
  };
  const tooSmallField = Object.keys(sizedFields).find(field => 'min' in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min);

  const tooLargeField = Object.keys(sizedFields).find(field => 'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max);

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField ? `Password must be at least ${sizedFields[tooSmallField].min} characters long` :  `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }
  let { password, email, name } = req.body;

  return User.find({email})
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Oops that e-mail already exists! Please log-in.',
          location: 'email'
        });
      }
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        name,
        email,
        password: hash
      });
    })
    .then(user => {
      return res.status(201).location(`/api/users/${user.id}`).json(user.apiRepr());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Uh oh, something went wrong with our server. Please try again.'});
    });
});

module.exports = { router };