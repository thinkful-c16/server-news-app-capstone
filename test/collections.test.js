'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const mongoose = require('mongoose');
const { app } = require('../index');
const { User } = require('../users');
const faker = require('faker');
const  jwt  = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../config');

const {TEST_DATABASE_URL} = require('../config');
const {dbConnect, dbDisconnect} = require('../db-mongoose');

process.env.NODE_ENV = 'test';

// Clear the console before each run
process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);

const tearDownDb = () => {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
};

//pass the header after the jwt creation

describe('User Collections Resource', function() {
  let authToken;
  const testUser = {
    email: faker.internet.email(),
    name: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    password: faker.internet.password()
  };
  
  before(function() {
    console.log('starting web server for collections tests');
    dbConnect(TEST_DATABASE_URL);
    return User.hashPassword(testUser.password)
      .then(password => User.create({
        email: testUser.email,
        name: testUser.name,
        password
      }))
      .then(user => {
        return jwt.sign({user}, JWT_SECRET, {
          subject: user.email,
          expiresIn: JWT_EXPIRY,
          algorithm: 'HS256'
        });
      }).then(token => authToken = token);
  });

  // beforeEach(function() {
  //   console.log('login the user');
  //   return User.findOne().then(user => console.log(user));
  // });

  after(function() {
    console.log('Disconnecting server');
    return tearDownDb()
      .then(() => dbDisconnect());
  });

  describe('POST endpoint for a new collection', () => {
    const testCollection = {
      collectionTitle: 'Test',
      collectionArticles: []
    };

    it('should add a new collection', () => {
      return chai.request.agent(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCollection)
        .then(res => {
          res.should.have.status(201);
          res.should.be.json;
          res.body.collectionTitle.should.equal(testCollection.collectionTitle);
          res.body.collectionArticles.should.be.an('array');
        });
    });
  });

  
});

