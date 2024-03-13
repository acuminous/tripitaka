const { strictEqual: eq } = require('assert');
const { processors: { empty } } = require('../..');

describe('empty', () => {
  it('should work out of the box', () => {
    const fn = empty({ index: 2 });
    const result = fn({ record: {} });
    eq(result.message, `Empty message logged at Test._fn (${__filename}:7:20)`);
  });
});
