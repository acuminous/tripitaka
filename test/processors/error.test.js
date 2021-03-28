const { strictEqual: eq, match } = require('assert');
const { processors: { error } } = require('../..');

describe('error', () => {

  describe('message is an instance of error', () => {

    it('should nest the error on the record', () => {
      const fn = error();
      const message = new Error('Oh Noes!');
      const result = fn({ message });

      eq(result.error.message, 'Oh Noes!');
      match(result.error.stack, /^Error: Oh Noes!/);
    });

    it('should set the record message', () => {
      const fn = error();
      const message = new Error('Oh Noes!');
      const result = fn({ message });

      eq(result.message, 'Oh Noes!');
    });

    it('should nest with a custom property', () => {
      const fn = error({ field: 'e' });
      const message = new Error('Oh Noes!');
      const result = fn({ message });

      eq(result.e.message, 'Oh Noes!');
      match(result.e.stack, /^Error: Oh Noes!/);
    });
  });

  describe('context is an instance of error', () => {

    it('should nest the error on the record', () => {
      const fn = error();
      const ctx = new Error('Oh Noes!');
      const result = fn({ message: 'ZenHub Errors!', ctx });

      eq(result.error.message, 'Oh Noes!');
      match(result.error.stack, /^Error: Oh Noes!/);
    });

    it('should nest with a custom property', () => {
      const fn = error({ field: 'e' });
      const ctx = new Error('Oh Noes!');
      const result = fn({ message: 'ZenHub Errors!', ctx });

      eq(result.e.message, 'Oh Noes!');
      match(result.e.stack, /^Error: Oh Noes!/);
    });
  });

  describe('context includes an instance of error', () => {

    it('should correctly capture error details when provided via context', () => {
      const fn = error();
      const ctx = { a: 'b', error: new Error('Oh Noes!'), x: 'y' };

      const result = fn({ ctx });

      eq(result.error.message, 'Oh Noes!');
      match(result.error.stack, /^Error: Oh Noes!/);
    });

  });
});