const { Logger, processors } = require('../..');
const { v4: uuid } = require('uuid');
const express = require('express');
const { AsyncLocalStorage } = require('async_hooks');

const { augment, context, error, timestamp, json } = processors;
const app = express();
const als = new AsyncLocalStorage();

const logger = new Logger({
  processors: [
    context(),
    error(),
    augment({ source: () => Object.fromEntries(als.getStore()) }),
    timestamp(),
    json(),
  ]
});

app.use((req, res, next) => {
  als.run(new Map(), () => {
    const store = als.getStore();
    store.set('tracerId', uuid());
    store.set('request', { method: req.method, url: req.url })
    next();
  });
});

app.get('/foo', (req, res) => {
  logger.info('Hello world');
  res.send('Hello world\n');
})

app.listen(3000, () => {
  console.log('listening')
});