const { deepStrictEqual: eq } = require('assert');
const { Level, processors: { timestamp } } = require('../..');

describe('timestamp', () => {

  const level = Level.INFO.name;
  const message = 'ZenLog rocks!';

  it('should work out of the box', () => {
    const fn = timestamp();
    const ctx = {};
    const result = fn({ level, message, ctx });
    eq(result.ctx.timestamp.constructor.name, 'Date');
  });

  it('should decorate context with a timestamp', () => {
    const ts = new Date();
    const fn = timestamp({ getTimestamp: () => {return ts;} });
    const ctx = {};
    const result = fn({ level, message, ctx });
    eq(result, { level, message, ctx: { timestamp: ts } });
  });

  it('should use the specified key', () => {
    const ts = new Date();
    const fn = timestamp({ field: 'xtimestamp', getTimestamp: () => {return ts;} });
    const ctx = {};
    const result = fn({ level, message, ctx });
    eq(result, { level, message, ctx: { xtimestamp: ts }});
  });
});