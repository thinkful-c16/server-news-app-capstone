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
  console.info('seeding user data');
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
  let authenticatedUser = chai.request(app);
  const userCreds = {
    email: 'helloworld@gov.com',
    name: {
      firstName: 'TestUser',
      lastName: 'TestUser'
    },
    password: '12345'
  };
  
  before(function(done) {
    console.log('starting web server for tests');
    dbConnect(TEST_DATABASE_URL);
    console.log('register a new user');
    authenticatedUser
      .post('/api/users')
      .send(userCreds)
      .end(function(err, res) {
        expect(res.statusCode).to.equal(201);
        done()
      });
  });

  beforeEach(function() {


  });
    
  after(function() {
    tearDownDb();
    return dbDisconnect();
  });
  
  it('logs in the user', function(done) {

    authenticatedUser   
      .post('/api/auth/login')
      .send({email: userCreds.email, password: userCreds.password})
      .end((err, response) => {
        expect(response.statusCode).to.equal(200);
        expect('Location', '/');
        done();
      });

  });
});