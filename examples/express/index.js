const { v4: uuid } = require('uuid');
const express = require('express');
const { AsyncLocalStorage } = require('async_hooks');
const LoggerFactory = require('./LoggerFactory')

const app = express();
const als = new AsyncLocalStorage();
LoggerFactory.init(als);

app.use((req, res, next) => {
  als.run(new Map(), () => {
    const store = als.getStore();
    store.set('tracerId', uuid());
    store.set('request', { method: req.method, url: req.url })
    next();
  });
});

app.get('/status', (req, res) => {
  const logger = LoggerFactory.getInstance();
  logger.info('checking status');
  res.send('OK\n');
})

app.listen(3000, () => {
  console.log('listening')
});