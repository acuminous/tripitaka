const { Logger, processors } = require('../..');
const { augment, context, error, timestamp, json } = processors;
let logger;

module.exports = class LoggerFactory {

  static init(als) {
    logger = new Logger({
      processors: [
        context(),
        error(),
        augment({ source: () => Object.fromEntries(als.getStore()) }),
        timestamp(),
        json(),
      ]
    });
  }

  static  getInstance() {
    return logger;
  }
};
