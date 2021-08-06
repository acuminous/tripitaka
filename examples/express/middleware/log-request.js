const LoggerFactory = require('../LoggerFactory');

module.exports = (req, res, next) => {

  const request = {
    method: req.method,
    url: req.originalUrl,
    route: req.route.path,
    params: req.params,
    start: Date.now(),
  };

  res.once('finish', function() {

    request.duration = Date.now() - request.start;
    /* eslint-disable-next-line no-invalid-this */
    request.status = this.statusCode;

    const logger = LoggerFactory.getInstance();
    if (request.status < 400) {
      logger.info(`${request.method} ${request.url} ${request.status}`, { request });
    } else {
      logger.error(`${request.method} ${request.url} ${request.status}`, { request });
    }
  });

  next();
};