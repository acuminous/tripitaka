const { Logger, processors } = require('../..');
const { augment, error, index, json, timestamp } = processors;
let logger;

module.exports = class LoggerFactory {

  static init(als) {
    logger = new Logger({
      processors: [
        error(),
        augment({ source: () => {return Object.fromEntries(als.getStore());} }),
        timestamp(),
        index({ paths: [
          'request.url',
          'request.route',
          'request.status',
          'request.params.id',
          'tracerId',
        ], reportComplexTypes: true }),
        json(),
      ]
    });
  }

  static  getInstance() {
    return logger;
  }
};
