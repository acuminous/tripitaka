const { deepStrictEqual: eq } = require('assert');
const { Level, processors: { condense } } = require('../..');

describe('condense', () => {

  it('should condense level, message and ctx', () => {
    const fn = condense();
    const level = Level.INFO.name;
    const message = 'ZenLog rocks!';
    const ctx = { a: 'b' };
    const result = fn({ level, message, ctx });
    eq(result, { level, message: 'ZenLog rocks!', a: 'b' });
  });
});