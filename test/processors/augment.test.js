const { deepStrictEqual: eq } = require('assert');
const { Level, processors: { augment } } = require('../..');

describe('augment', () => {

  const level = Level.INFO.name;
  const message = 'ZenLog rocks!';

  describe('function', () => {
    it('should augment the context with the results of the supplied function', () => {
      const fn = augment(() => {return { x: 'y' };});
      const ctx = { a: 'b' };
      const result = fn({ level, message, ctx });
      eq(result, { level, message, ctx: { a: 'b', x: 'y' }});
    });

    it('should prefer context to augmentation', () => {
      const fn = augment(() => {return { x: 'y' };});
      const ctx = { x: 'z' };
      const result = fn({ level, message, ctx });
      eq(result, { level, message, ctx: { x: 'z' }});
    });

    it('should not mutate the context', () => {
      const fn = augment(() => {return { x: 'y' };});
      const ctx = { a: 'b' };
      fn({ level, message, ctx });
      eq(ctx, { a: 'b' });
    });
  });

  describe('object', () => {

    it('should augment the context with the supplied object', () => {
      const fn = augment({ x: 'y' });
      const ctx = { a: 'b' };
      const result = fn({ level, message, ctx });
      eq(result, { level, message, ctx: { a: 'b', x: 'y' }});
    });

    it('should prefer context to augmentation', () => {
      const fn = augment({ x: 'y' });
      const ctx = { x: 'z' };
      const result = fn({ level, message, ctx });
      eq(result, { level, message, ctx: { x: 'z' }});
    });

    it('should not mutate the context', () => {
      const fn = augment({ x: 'y' });
      const ctx = { a: 'b' };
      fn(ctx);
      eq(ctx, { a: 'b' });
    });
  });

});