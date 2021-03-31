const { v4: uuid } = require('uuid');
const express = require('express');
const { AsyncLocalStorage } = require('async_hooks');
const LoggerFactory = require('./LoggerFactory')

const app = express();
const router = express.Router()

const als = new AsyncLocalStorage();
LoggerFactory.init(als);

router.use((req, res, next) => {
  als.run(new Map(), () => {
    const store = als.getStore();
    store.set('tracerId', uuid());
    store.set('request', { method: req.method, url: req.originalUrl })
    next();
  });
});

router.use((req, res, next) => {
  res.once('finish', (...args) => {
    console.log(args);
  })
  next()
})


router.get('/status', (req, res) => {
  const logger = LoggerFactory.getInstance();
  logger.info('checking status');
  res.send('OK\n');
})

app.use(router);

app.listen(3000, () => {
  console.log('listening')
});