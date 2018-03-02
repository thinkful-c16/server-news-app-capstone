'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.Promise = global.Promise;

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true},    
  name: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }
  },
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
    title: { type: String },
    url: { type: String},
    image: { type: String },
    author: { type: String },
    source: {
      id: { type: String },
      name: { type: String }
    },
    dateShared: { type: Date, default: Date.now }
  }],
  usersFollowing: [{
    // _id: mongoose.Schema.Types.ObjectId,
    userName: { type: String }
  }],
  usersFollowed: [{
    // _id: mongoose.Schema.Types.ObjectId,        
    userName: { type: String } 
  }],
  usersFollowingCount: { type: Number },
  usersFollowedCount: { type: Number },
  collections: [{
    // _id: mongoose.Schema.Types.ObjectId,
    collectionTitle: { type: String },
    dateCreated: { type: Date, default: Date.now },
    collectionArticles: [{
      // _id: mongoose.Schema.Types.ObjectId,
      source: {
        id: { type: String },
        name: { type: String }
      },
      title: { type: String },
      author: { type: String },
      description: { type: String },
      image: { type: String},
      url: { type: String },
      dateAdded: { type: Date, default: Date.now }
    }]
  }]
    
  //anything else we can think of to include
});

UserSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    email: this.email,
    firstName: this.name.firstName || '',
    lastName: this.name.lastName || ''
  };
};

UserSchema.methods.getCollection = function() {
  return {
    collectionTitle: this.collection_title,
    collectionArticles: this.collectionArticles
  };
};
  
UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};
  
UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = { User };