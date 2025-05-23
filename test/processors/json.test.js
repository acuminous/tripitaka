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

  it('should support custom serializer', () => {
    const serializer = (key, value) => {
      return key === 'x' ? 'z' : value;
    };
    const fn = json({ serializer });
    const result = fn({ record: { x: 'y' } });
    eq(result, '{"x":"z"}');
  });

  it('should support lazy configuration', () => {
    const serializer = (key, value) => {
      return key === 'x' ? 'z' : value;
    };
    const params = {};
    const fn = json(params);
    Object.assign(params, { serializer });
    const result = fn({ record: { x: 'y' } });
    eq(result, '{"x":"z"}');
  });
});
