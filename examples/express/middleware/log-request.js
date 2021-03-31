const { v4: uuid } = require('uuid');
const LoggerFactory = require('../LoggerFactory');

module.exports = (req, res, next) => {
  const store = req.app.locals.als.getStore();
  store.set('tracerId', uuid());
  store.set('request', {
    method: req.method,
    url: req.originalUrl,
    route: req.route.path,
    params: req.params,
    start: Date.now(),
  });

  res.once('finish', function() {
    const store = req.app.locals.als.getStore();
    const request = store.get('request');
    request.duration = Date.now() - request.start;
    /* eslint-disable-next-line no-invalid-this */
    request.status = this.statusCode;

    const logger = LoggerFactory.getInstance();
    if (request.status < 400) {
      logger.info(request.originalUrl);
    } else {
      logger.error(request.originalUrl);
    }
  });

  next();
};