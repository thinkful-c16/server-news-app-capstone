'use strict';
const { Strategy: FacebookStrategy } = require('passport-facebook');
const { User } = require('../user/models');
const { JWT_SECRET } = require('../config');
const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET} = require('../config');

const facebookStrategy = new FacebookStrategy({
  clientId: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: 'http://localhost:3000/auth/facebook/callback',
  profileFields: ['id', 'email', 'name']
},
function(accessToken, refreshToken, profile, done) {
  console.log('User profile', profile);
  User.findOne({ 'facebook.id': profile.id }, function(err, user) {
    if (err) {
      return done (err);
    }
    if (user) {
      return done(null, user);
    } else {
      let newUser = new User();
      newUser.facebook.id = profile.id; //set user's fb id
      newUser.facebook.token = accessToken;
      newUser.facebook.email = profile.emails[0].value;
      newUser.facebook.name = profile.displayName;
      newUser.save(function(err) {
        if (err) {
          throw err;
        }
        return done(null, newUser);
      })
    }
  })
})