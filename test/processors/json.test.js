const { strictEqual: eq } = require('assert');
const { processors: { json } } = require('../..');

describe('json', () => {
  it('should stringify the context', () => {
    const fn = json();
    const result = fn({ record: { x: 'y' } });
    eq(result, '{"x":"y"}');
  });

  it('should strip circular references', () => {
    const fn = json();
    const record = { x: 'y' };
    record.circular = record;
    const result = fn({ record });
    eq(result, '{"x":"y"}');
  });
});
