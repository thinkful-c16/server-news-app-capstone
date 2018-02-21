'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.Promise = global.Promise;

const UserSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true},    
  name: [{
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }
  }],
  password: { type: String },
  confirmation_code: { type: String },
  confirmed: { type: Boolean, default: false },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  likes: { type: Boolean, default: false },
  articlesShared: [{
    _id: mongoose.Schema.Types.ObjectId,
    articleTitle: {type: String},
    numberOfArticles: {type: Number}
  }],
  usersFollowing: [{
    _id: mongoose.Schema.Types.ObjectId,
    userName: { type: String }
  }],
  usersFollowed: [{
    _id: mongoose.Schema.Types.ObjectId,        
    userName: { type: String } 
  }],
  usersFollowingCount: { type: Number },
  usersFollowedCount: { type: Number }
    
  //anything else we can think of to include
});

// EventSchema.methods.apiRepr = function(){
//     return {
//         id: this._id,
//         userName: this.userName,
//         //rest of the user model
//     }
// }

UserSchema.methods.apiRepr = function() {
  return {
    username: this.userName || '',
    firstName: this.firstName || '',
    lastName: this.lastName || ''
  };
};
  
UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};
  
UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

let User = mongoose.model('User', UserSchema);

module.exports = { User };