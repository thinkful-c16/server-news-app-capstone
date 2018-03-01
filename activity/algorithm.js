'use strict';
const { User } = require('../users');

//activity types: articleShared, collectionCreated, articled added to collection

//GET ALL USERS ACTIVITY

// User.find()
//   .then(users => {
//     articleActivity: {
//       users.collections.articlesShared,
//       users.collections,
//       user.collections.collectionArticles
//   })
//   .then(object => console.log(object))

class _Node {
  constructor(data) {
    this.data = data;
    this.next = null;
    this.prev = null;
  }
}

class Queue {
  constructor() {
    this.first = null;
    this.last = null;
  }

  enqueue(data) {
    const activity = new _Node(data);
    if (this.first === null) {
      this.first = activity;
    }
    if (this.last) {
      activity.next = this.last;
      this.last.prev = activity;
    }
    this.last = activity;
  }

  dequeue() {
    if (this.first === null) {
      return;
    }
    const activity = this.first;
    this.first = activity.prev;

    if (activity === this.last) {
      this.last = null;
    }
    return activity.data;
  }
}

module.exports = { Queue };