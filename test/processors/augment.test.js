const { deepStrictEqual: eq } = require('assert');
const { processors: { augment } } = require('../..');

describe('augment', () => {
  describe('function', () => {
    it('should augment the record with the results of the supplied function', () => {
      const source = () => {
        return { x: 'y' };
      };
      const fn = augment({ source });
      const result = fn({ record: { a: 'b' } });
      eq(result, { a: 'b', x: 'y' });
    });

    it('should prefer source to record', () => {
      const source = () => {
        return { x: 'y' };
      };
      const fn = augment({ source });
      const result = fn({ record: { x: 'z' } });
      eq(result, { x: 'y' });
    });

    it('should not mutate the record', () => {
      const source = () => {
        return { x: 'y' };
      };
      const fn = augment({ source });
      const record = { a: 'b' };
      fn({ record });
      eq(record, { a: 'b' });
    });
  });

  describe('object', () => {
    it('should augment the source with the supplied object', () => {
      const fn = augment({ source: { x: 'y' } });
      const result = fn({ record: { a: 'b' } });
      eq(result, { a: 'b', x: 'y' });
    });

    it('should prefer source to record', () => {
      const fn = augment({ source: { x: 'y' } });
      const result = fn({ record: { x: 'z' } });
      eq(result, { x: 'y' });
    });

    it('should not mutate the source', () => {
      const fn = augment({ source: { x: 'y' } });
      const record = { a: 'b' };
      fn({ record });
      eq(record, { a: 'b' });
    });
  });
});
