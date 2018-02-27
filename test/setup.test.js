'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const mongoose = require('mongoose');
const { app } = require('../index');
const { User } = require('../users');
const faker = require('faker');

const {TEST_DATABASE_URL} = require('../config');
const {dbConnect, dbDisconnect} = require('../db-mongoose');
// const {dbConnect, dbDisconnect} = require('../db-knex');

// Set NODE_ENV to `test` to disable http layer logs
// You can do this in the command line, but this is cross-platform
process.env.NODE_ENV = 'test';

// Clear the console before each run
process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);

const generateUserData = () => {
  return {
    email: faker.internet.email(),
    name: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    password: faker.internet.password()
  };
};
const seedUserData = () => {
  console.info('seeing user data');
  const userData = [];
  for (let i=0; i <= 5; i++) {
    userData.push(generateUserData());
  }
  return User.insertMany(userData);
};

const tearDownDb = () => {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
};

describe('Mocha and Chai', function() {
  it('should be properly setup', function() {
    expect(true).to.be.true;
  });
});

describe('Collections Resource', function() {
  
  before(function() {
    console.log('starting web server for tests');
    return dbConnect(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedUserData();
  });
    
  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return dbDisconnect();
  });
  
  it('should create a new collection', function() {
    const newCollection = {
      collectionTitle: 'Test collection',
      collectionArticles: []
    };
    return chai.request(app)
      .post('/api/collections/')
      .send(newCollection)
      .then(function(response) {
        response.should.have.status(201);
      });
  });
});