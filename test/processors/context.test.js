const { deepStrictEqual: eq } = require('assert');
const { processors: { context } } = require('../..');

describe('context', () => {

  it('should return a shallow copy of the context', () => {
    const fn = context();
    const result = fn({ ctx: { a: 'b', x: 'y'} });
    eq(result, { a: 'b', x: 'y' });
  });

  it('should short circuit when context is an error', () => {
    const fn = context();
    const result = fn({ ctx: new Error('Oooh, Demons!') });
    eq(result, undefined);
  });
});