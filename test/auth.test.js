'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const mongoose = require('mongoose');
const { app } = require('../index');
const { User } = require('../users');
const faker = require('faker');
const  jwt  = require('jsonwebtoken');
const fetch = require('node-fetch');
const { JWT_SECRET, JWT_EXPIRY, FACEBOOK_APP_ID, FACEBOOK_APP_TOKEN } = require('../config');

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

describe('Mocha and Chai', function() {
  it('should be properly setup', function() {
    expect(true).to.be.true;
  });
});

describe('User Authentication', function() {

  const testUser = {
    email: 'helloworld@gov.com',
    name: {
      firstName: 'TestUser',
      lastName: 'TestUser'
    },
    password: '12345'
  };
  
  before(function() {
    console.log('starting web server for authentication tests');
    dbConnect(TEST_DATABASE_URL);
    return User.hashPassword(testUser.password)
      .then(password => User.create({
        email: testUser.email,
        name: testUser.name,
        password
      }));
  });

  after(function() {
    console.log('Disconnecting server');
    return tearDownDb()
      .then(() => dbDisconnect());
  });


  describe('Registration', () => {

    it('registers the test user', () => {
      let newUser = {
        email: faker.internet.email(),
        name: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName()
        },
        password: faker.internet.password()
      };
      return chai.request.agent(app)
        .post('/api/users')
        .send(newUser)
        .then(res => {
          expect(res).to.have.status(201);
          return User.findById(res.body.id)
            .then(user => {
              expect(user.email).to.equal(newUser.email);
            });
        });
    });
  });

  it('logs the test user in', () => {
    return chai.request.agent(app)
      .post('/api/auth/login')
      .send({email: testUser.email, password: testUser.password})
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.authToken).to.be.a('string');
        expect(res).to.be.json;
      });
  });

  describe('Social Media Authentication', () => {

    const fetchValidToken = () => {
      return fetch(`https://graph.facebook.com/${FACEBOOK_APP_ID}/accounts/test-users?access_token=${FACEBOOK_APP_TOKEN}`).then(response => response.json().then(data => {
        const randomTestUser = data.data[Math.floor(Math.random() * data.data.length)];
        return randomTestUser;
      }));
    };
    const fbTestUser1 = {
      token: ''
    };
    it('should verify the fb token and return a valid JWT', () => {
      return fetchValidToken()
        .then(token => {
          fbTestUser1.token = token.access_token;
          return chai.request.agent(app)
            .post('/api/auth/facebook')
            .send(fbTestUser1)
            .then(res => {
              res.body.authToken.should.exist;
            })
            .then(() => {
              return User.findOne({'facebook.token': fbTestUser1.token })
                .then(user => {
                  user.facebook.token.should.equal(fbTestUser1.token);
                });
            });
        });
    });
    it('should create an email for the user if null', () => {
      return User.findOne({'facebook.token': fbTestUser1.token })
        .then(res => {
          const concatFb = res.email.substring(60, res.email.length);
          res.email.should.exist;
          res.email.should.contain(concatFb);
        });
    });
  });
});

