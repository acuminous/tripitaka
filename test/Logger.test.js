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
        processors.condense(),
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

    eq(streams[Level.TRACE.name].lines, [`{"x":"y","timestamp":"${ts.toISOString()}","message":"ZenLog traces!","level":"TRACE"}`]);
    eq(streams[Level.DEBUG.name].lines, [`{"x":"y","timestamp":"${ts.toISOString()}","message":"ZenLog debugs!","level":"DEBUG"}`]);
    eq(streams[Level.INFO.name].lines, [
      `{"x":"y","timestamp":"${ts.toISOString()}","message":"ZenLog rocks once!","level":"INFO"}`,
      `{"timestamp":"${ts.toISOString()}","message":"ZenLog rocks twice!","level":"INFO"}`
    ]);
    eq(streams[Level.WARN.name].lines, [`{"x":"y","timestamp":"${ts.toISOString()}","message":"ZenLog warns!","level":"WARN"}`]);
    eq(streams[Level.ERROR.name].lines, [`{"error":{"message":"Oh Noes!"},"timestamp":"${ts.toISOString()}","message":"ZenLog errors!","level":"ERROR"}`]);
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
        processors.condense(),
        processors.json(),
      ],
      transports: [
        transports.stream({ streams })
      ]
    });

    logger.info('ZenLog rocks!', { x: 'y' });

    eq(streams[Level.INFO.name].lines, [`{"x":"y","timestamp":"${ts.toISOString()}","message":"ZenLog rocks!","level":"INFO"}`]);
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