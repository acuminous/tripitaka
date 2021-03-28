const { deepStrictEqual: eq } = require('assert');
const { TestOutputStream }  = require('./support');
const { Level, Logger, processors, transports } = require('..');

describe('Logger', () => {

  let streams;

  beforeEach(() => {
    streams = Object.values(Level).reduce((streams, level) => {
      return { ...streams, [level.name]: new TestOutputStream() };
    }, {});
  });

  afterEach(() => {
    Object.values(streams).forEach(stream => {return stream.destroy();});
  });

 it('should log messages', () => {
    const ts = new Date();
    const logger = new Logger({
      processors: [
        processors.error({ stack: false }),
        processors.timestamp({
          getTimestamp: () => {
            return ts;
          }
        }),
        processors.json(),
      ],
      transports: [
        transports.stream({ streams })
      ],
      level: Level.TRACE,
    });

    logger.trace('ZenLog traces!', { x: 'y' });
    logger.debug('ZenLog debugs!', { x: 'y' });
    logger.info('ZenLog rocks once!', { x: 'y' });
    logger.info('ZenLog rocks twice!');
    logger.warn('ZenLog warns!', { x: 'y' });
    logger.error('ZenLog errors!', new Error('Oh Noes!'));

    eq(streams[Level.TRACE.name].lines, [`{"level":"TRACE","message":"ZenLog traces!","x":"y","timestamp":"${ts.toISOString()}"}`]);
    eq(streams[Level.DEBUG.name].lines, [`{"level":"DEBUG","message":"ZenLog debugs!","x":"y","timestamp":"${ts.toISOString()}"}`]);
    eq(streams[Level.INFO.name].lines, [
      `{"level":"INFO","message":"ZenLog rocks once!","x":"y","timestamp":"${ts.toISOString()}"}`,
      `{"level":"INFO","message":"ZenLog rocks twice!","timestamp":"${ts.toISOString()}"}`
    ]);
    eq(streams[Level.WARN.name].lines, [`{"level":"WARN","message":"ZenLog warns!","x":"y","timestamp":"${ts.toISOString()}"}`]);
    eq(streams[Level.ERROR.name].lines, [`{"error":{"message":"Oh Noes!"},"level":"ERROR","message":"ZenLog errors!","timestamp":"${ts.toISOString()}"}`]);
  });

  it('should ignore falsy processors', () => {
    const ts = new Date();
    const logger = new Logger({
      processors: [
        processors.error({ stack: false }),
        processors.timestamp({ getTimestamp: () => {
          return ts;
        } }),
        () => {return false;},
        () => {return null;},
        () => {return undefined;},
        processors.json(),
      ],
      transports: [
        transports.stream({ streams })
      ]
    });

    logger.info('ZenLog rocks!', { x: 'y' });

    eq(streams[Level.INFO.name].lines, [`{"level":"INFO","message":"ZenLog rocks!","x":"y","timestamp":"${ts.toISOString()}"}`]);
  });

  it('should support being disabled', () => {
    const logger = new Logger({
      transports: [
        transports.stream({ streams })
      ],
    });

    logger.disable();
    logger.info('ZenLog rocks!', { x: 'y' });
    eq(streams[Level.INFO.name].lines.length, 0);
  });

  it('should support being enabled', () => {
    const logger = new Logger({
      transports: [
        transports.stream({ streams })
      ],
    });

    logger.disable();
    logger.enable();

    logger.info('ZenLog rocks!', { x: 'y' });
    eq(streams[Level.INFO.name].lines.length, 1);
  });
});