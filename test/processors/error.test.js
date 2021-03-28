const { strictEqual: eq, match } = require('assert');
const { Level, processors: { error } } = require('../..');

describe('error', () => {

  const level = Level.INFO.name;
  const message = 'ZenLog rocks!';

  it('should relocate to ctx.error if the message is an instance of Error', () => {
    const fn = error();
    const message = new Error('Oh Noes!');

    const result = fn({ level, message });

    eq(Object.keys(result).length, 3);
    eq(result.message, 'Oh Noes!');
    eq(Object.keys(result.ctx.error).length, 2);
    eq(result.ctx.error.message, 'Oh Noes!');
    match(result.ctx.error.stack, /^Error: Oh Noes!/);
  });

  it('should relocate to ctx.error if the context is an instance of Error', () => {
    const fn = error();
    const ctx = new Error('Oh Noes!');

    const result = fn({ level, message, ctx });

    eq(Object.keys(result).length, 3);
    eq(Object.keys(result.ctx.error).length, 2);
    eq(result.ctx.error.message, 'Oh Noes!');
    match(result.ctx.error.stack, /^Error: Oh Noes!/);
  });

  it('should support custom nesting', () => {
    const fn = error({ field: 'e' });
    const ctx = new Error('Oh Noes!');

    const result = fn({ level, message, ctx });

    eq(Object.keys(result).length, 3);
    eq(Object.keys(result.ctx.e).length, 2);
    eq(result.ctx.e.message, 'Oh Noes!');
    match(result.ctx.e.stack, /^Error: Oh Noes!/);
  });

  it('should correctly capture error details when provided via context', () => {
    const fn = error();
    const ctx = { a: 'b', error: new Error('Oh Noes!'), x: 'y' };

    const result = fn({ level, message, ctx });

    eq(Object.keys(result).length, 3);
    eq(Object.keys(result.ctx).length, 3);
    eq(Object.keys(result.ctx.error).length, 2);
    eq(result.ctx.error.message, 'Oh Noes!');
    match(result.ctx.error.stack, /^Error: Oh Noes!/);
  });
});