const { deepStrictEqual: eq } = require('assert');
const { EventEmitter } = require('events');
const { Level, transports: { emitter } } = require('../..');

describe('emitter', () => {

  it('should work out of the box', (t, done) => {
    const fn = emitter();
    process.once('log', (record) => {
      eq(record, { x: 'y' });
      done();
    });
    fn({ level: Level.INFO, record: { x: 'y' } });
  });

  it('should use the specified event', (t, done) => {
    const fn = emitter({
      events: {
        [Level.INFO.name]: 'info',
      }
    });

    process.once('info', (record) => {
      eq(record, { x: 'y' });
      done();
    });
    fn({ level: Level.INFO, record: { x: 'y' } });
  });

  it('should use the specified emitter', (t, done) => {
    const eventEmitter = new EventEmitter();
    const fn = emitter({ emitter: eventEmitter });

    eventEmitter.once('log', (record) => {
      eq(record, { x: 'y' });
      done();
    });
    fn({ level: Level.INFO, record: { x: 'y' } });
  });
});