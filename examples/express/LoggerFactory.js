const { Logger, processors } = require('../..');

const { augment, context, index, json, timestamp } = processors;
let logger;

module.exports = class LoggerFactory {
  static init(als) {
    logger = new Logger({
      processors: [
        context(),
        augment({
          source: () => Object.fromEntries(als.getStore()),
        }),
        timestamp(),
        index({
          paths: ['request.url', 'request.route', 'request.status', 'request.params.id', 'tracerId'],
          reportComplexTypes: true,
        }),
        json(),
      ],
    });
  }

  static getInstance() {
    return logger;
  }
};
