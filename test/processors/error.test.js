const { strictEqual: eq, match } = require('assert');
const { processors: { error } } = require('../..');

describe('error', () => {

  describe('message is an instance of error', () => {

    it('should nest the error on the record', () => {
      const fn = error();
      const message = new Error('Oooh, Demons!');
      const result = fn({ message });

      eq(result.error.message, 'Oooh, Demons!');
      match(result.error.stack, /^Error: Oooh, Demons!/);
    });

    it('should set the record message', () => {
      const fn = error();
      const message = new Error('Oooh, Demons!');
      const result = fn({ message });

      eq(result.message, 'Oooh, Demons!');
    });

    it('should nest with a custom property', () => {
      const fn = error({ field: 'e' });
      const message = new Error('Oooh, Demons!');
      const result = fn({ message });

      eq(result.e.message, 'Oooh, Demons!');
      match(result.e.stack, /^Error: Oooh, Demons!/);
    });
  });

  describe('context is an instance of error', () => {

    it('should nest the error on the record', () => {
      const fn = error();
      const ctx = new Error('Oooh, Demons!');
      const result = fn({ message: 'Oooh, Demons!', ctx });

      eq(result.error.message, 'Oooh, Demons!');
      match(result.error.stack, /^Error: Oooh, Demons!/);
    });

    it('should nest with a custom property', () => {
      const fn = error({ field: 'e' });
      const ctx = new Error('Oooh, Demons!');
      const result = fn({ message: 'Oooh, Demons!', ctx });

      eq(result.e.message, 'Oooh, Demons!');
      match(result.e.stack, /^Error: Oooh, Demons!/);
    });
  });

  describe('context includes an instance of error', () => {

    it('should correctly capture error details when provided via context', () => {
      const fn = error();
      const ctx = { a: 'b', error: new Error('Oooh, Demons!'), x: 'y' };

      const result = fn({ ctx });

      eq(result.error.message, 'Oooh, Demons!');
      match(result.error.stack, /^Error: Oooh, Demons!/);
    });

  });
});