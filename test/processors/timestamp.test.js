const { deepStrictEqual: eq } = require('assert');
const { processors: { timestamp } } = require('../..');

describe('timestamp', () => {
  it('should work out of the box', () => {
    const fn = timestamp();
    const result = fn({ record: {} });
    eq(result.timestamp.constructor.name, 'Date');
  });

  it('should decorate context with a timestamp', () => {
    const ts = new Date();
    const fn = timestamp({
      getTimestamp: () => ts,
    });
    const result = fn({ record: {} });
    eq(result, { timestamp: ts });
  });

  it('should use the specified key', () => {
    const ts = new Date();
    const fn = timestamp({ field: 'xtimestamp', getTimestamp: () => ts });
    const result = fn({ record: {} });
    eq(result, { xtimestamp: ts });
  });
});
