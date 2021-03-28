const { strictEqual: eq } = require('assert');
const { processors: { json } } = require('../..');

describe('json', () => {

  it('should stringify the context', () => {
    const fn = json();
    const ctx = { x: 'y' };
    const result = fn({ ctx });
    eq(result, '{"ctx":{"x":"y"}}');
  });

  it('should strip circular references', () => {
    const fn = json();
    const ctx = { x: 'y' };
    ctx.circular = ctx;
    const result = fn({ ctx });
    eq(result, '{"ctx":{"x":"y"}}');
  });

});