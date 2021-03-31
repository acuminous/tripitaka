const express = require('express');
const { AsyncLocalStorage } = require('async_hooks');
const LoggerFactory = require('./LoggerFactory');
const logRequest = require('./middleware/log-request');
const getCharacter = require('./middleware/get-character');
const listCharacters = require('./middleware/list-characters');

const app = express();

const als = new AsyncLocalStorage();
LoggerFactory.init(als);
app.locals.als = als;

app.use((req, res, next) => {
  als.run(new Map(), () => {return next();});
});

app.get('/characters', logRequest, listCharacters);
app.get('/characters/:id', logRequest, getCharacter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(3000, () => {
  console.log('curl http://localhost:3000/characters');
  console.log('curl http://localhost:3000/characters/0');
  console.log('curl http://localhost:3000/characters/123');
});