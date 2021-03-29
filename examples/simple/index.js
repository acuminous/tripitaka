const { Logger, processors, transports } = require('../..');
const { context, error, timestamp, json, human } = processors;
const { stream } = transports;

const logger = new Logger({
  processors: [
    context(),
    error(),
    timestamp(),
    process.env.NODE_ENV === 'production' ? json() : human(),
  ],
  transports: [
    stream()
  ]
});

setInterval(() => {
  logger.info('Hey Buddah!', { pid: process.pid })
}, 1000);

setInterval(() => {
  logger.error('I love a good fight!', new Error('Oooh, Demons!'), { pid: process.pid })
}, 3000);