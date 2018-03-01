'use strict';

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const activityOptions = {
  NEW_COLLECTION: 'new collection',
  NEW_COLLECTION_ARTICLE: 'new collection article'
};

const ActivitySchema = new mongoose.Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  activityType: { type: String },
  date: { type: Date, default: Date.now },
  data: { type: Object }
});

const Activity = mongoose.model('Activity', ActivitySchema);

module.exports = { Activity, activityOptions };