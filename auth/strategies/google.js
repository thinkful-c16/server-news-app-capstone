'use strict';
const { Strategy: GoogleStrategy } = require('passport-google');
const { User } = require('../../users/model');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('../../config');

const googleStrategy = new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    returnURL: 'http://localhost:3000/auth/google/return',
    realm: 'http://localhost:3000/',
    profileFields: ['id', 'imageURL', 'name', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('Google user profile', profile);
    User.findOne({'google.id': profile.id}, function(err, user){
      if (err) {
        return done(err);
      }
      if (user) {
        return done(null, user);
      } else {
        let newUser = new User();
        newUser.google.id = profile.id;
        newUser.google.token = accessToken;
        newUser.name = `${profile.name.familyName} ${profile.name.givenName}`;
        newUser.confirmed = true;
        newUser.google.name = profile.displayName;
        newUser.google.email = profiles.emails[0].value;
        newUser.save(function(err) {
          if(err) {
            throw err;
          }
          return done(null, newUser)
        });
      }
    });
  }
);

module.exports = { googleStrategy };