'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const { app } = require('../index');
const { User } = require('../users');
const { Activity, activityOptions } = require('../activity');
const faker = require('faker');
const  jwt  = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../config');

const {TEST_DATABASE_URL} = require('../config');
const {dbConnect, dbDisconnect} = require('../db-mongoose');

process.env.NODE_ENV = 'test';

// Clear the console before each run
process.stdout.write('\x1Bc\n');

chai.use(chaiHttp);

const tearDownDb = () => {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
};

describe('User Activities Resource', function() {
  let authToken;
  let _u;

  const testUser = {
    email: faker.internet.email(),
    name: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    password: faker.internet.password()
  
  };


  before(function() {
    console.log('starting web server for activities tests');
    dbConnect(TEST_DATABASE_URL);

    return User.hashPassword(testUser.password)
      .then(password => User.create({
        email: testUser.email,
        name: testUser.name,
        password
      }))
      .then(user => {
        _u = user;
        user = user.apiRepr();
        return jwt.sign({user}, JWT_SECRET, {
          subject: user.email,
          expiresIn: JWT_EXPIRY,
          algorithm: 'HS256'
        });
      }).then(token => authToken = token)
      .then(() => {
        return Activity.create({
          owner: _u.id,
          activityType: activityOptions.NEW_COLLECTION,
          data: {
            username: `${_u.name.firstName} ${_u.name.lastName}`,
            collectionTitle: faker.lorem.sentence()
          }
        });
      });
  });

  after(function() {
    console.log('Disconnecting server');
    return tearDownDb()
      .then(() => dbDisconnect());
  });

  it('should return all the user interactions from the app', () => {
    console.log('testu >>>>>>',testUser)
    // const newCollection = {
    //   owner: _u._id,
    //   activityType: activityOptions.NEW_COLLECTION,
    //   data: {
    //     username: `${_u.name.firstName} ${_u.name.lastName}`,
    //     collectionTitle: faker.lorem.sentence()
    //   }
    // }
    return chai.request.agent(app)
      .get('/api/activities')
      .set('Authorization', `Bearer ${authToken}`)
      .then(res => {
        console.log(res.body);
        console.log(res.body['0'].data);
        res.should.have.status(200);
        res.should.be.json;
        res.body.length.should.equal(1);
        res.body['0'].activityType.should.equal('new collection');
        res.body['0'].data.username.should.equal(`${_u.name.firstName} ${_u.name.lastName}`);
      });
  });

  it('should create a shared article activity', () => {
    const sharedArticle = {
      owner: _u._id,
      activityType: activityOptions.SHARE_ARTICLE,
      data: {
        user: `${_u.name.firstName} ${_u.name.lastName}`,
        articleTitle: faker.lorem.sentence(),
        articleImage: faker.internet.url(),
        articleUrl: faker.internet.url(),
        articleSource: faker.lorem.sentence()
      },
      channel: faker.internet.url()
    };
    return chai.request.agent(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${authToken}`)
      .send(sharedArticle)
      .then(res => {
        console.log('POST ACTIVITY>>>>>>>',res.body);
        res.should.be.json;
        res.status.should.equal(201)
        res.body.activityType.should.equal('share article');
      })
  })
});

