const { deepStrictEqual: deq } = require('assert');
const { processors: { noop } } = require('../..');

describe('noop', () => {
  it('should pass through the parameters', () => {
    const fn = noop();
    const result = fn({ level: 1, message: 2, ctx: 3, record: { a: 'b' } });
    deq(result, { a: 'b' });
  });
});
