'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const mongoose = require('mongoose');
const { app } = require('../index');
const { User } = require('../users');
const { Activity } = require('../activity');
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

  after(function() {
    console.log('Disconnecting server');
    return tearDownDb()
      .then(() => dbDisconnect());
  });

  describe('POST endpoint for a new collection', () => {
    const testCollection = {
      collectionTitle: faker.lorem.word(),
      collectionArticles: []
    };
    const mySecondCollection = {
      collectionTitle: faker.lorem.word(),
      collectionArticles: []
    };
    const awesomeArticle = {
      title: faker.lorem.sentence(),
      author: `${faker.name.firstName()} ${faker.name.lastName()}`,
      description: faker.lorem.paragraph(),
      image: faker.internet.url(),
      url: faker.internet.url()
    };
    const aBetterArticle = {
      title: faker.lorem.sentence(),
      author: `${faker.name.firstName()} ${faker.name.lastName()}`,
      description: faker.lorem.paragraph(),
      image: faker.internet.url(),
      url: faker.internet.url()
    };

    it.only('should add a new collection', () => {
      return chai.request.agent(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCollection)
        .then(res => {
          // console.log(res.body);
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.contain.keys('_id', 'collectionTitle', 'collectionArticles');
          res.body.collectionTitle.should.equal(testCollection.collectionTitle);
          res.body.collectionArticles.should.be.an('array');
          return Activity.findOne({'data.$.owner': testUser._id})
            .then(result => {
              console.log('test--DATA?', result)
              console.log('res?????', res.body)
              should.exist(res.body);
              res.body.collectionTitle.should.equal(result.data.collectionTitle);

            });
        });
    });
    it('should add an article to a collection', () => {
      let collection;
    
      return User.findById(testUser.id)
        .then(user => {
          collection = user.collections[0];
          return chai.request.agent(app)
            .post(`/api/collections/${user.collections[0].id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(awesomeArticle);
        })
        .then(res => {
          res.should.have.status(201);
          res.body.collectionArticles.should.be.an('array');
          res.body.collectionArticles[0].should.be.an('object');
          res.body.collectionArticles[0].should.contain.keys('_id', 'title', 'url');
          res.body.collectionArticles[0].title.should.equal(awesomeArticle.title);
          res.body.collectionArticles[0].author.should.equal(awesomeArticle.author);
        });
    });
    it('should add an article to the correct collection (if multiple)', () => {
      let firstCollection;
      return chai.request.agent(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mySecondCollection)
        .then(() => {
          return User.findById(testUser.id)
            .then(user => {
              firstCollection = user.collections[0];
              return chai.request.agent(app)
                .post(`/api/collections/${user.collections[1].id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(aBetterArticle);
            })
            .then(res => {
              res.should.have.status(201);
              res.should.be.json;
              res.body._id.should.not.equal(firstCollection._id);
              res.body.collectionTitle.should.equal(mySecondCollection.collectionTitle);
            });
        });
    });
  });
});

