const { deepStrictEqual: eq } = require('assert');
const { Level } = require('..');

describe('Level', () => {

  it('should support pecking order', () => {
    eq(Level.TRACE.satisfies(Level.TRACE), true);
    eq(Level.TRACE.satisfies(Level.DEBUG), false);
    eq(Level.TRACE.satisfies(Level.INFO), false);
    eq(Level.TRACE.satisfies(Level.WARN), false);
    eq(Level.TRACE.satisfies(Level.ERROR), false);

    eq(Level.DEBUG.satisfies(Level.TRACE), true);
    eq(Level.DEBUG.satisfies(Level.DEBUG), true);
    eq(Level.DEBUG.satisfies(Level.INFO), false);
    eq(Level.DEBUG.satisfies(Level.WARN), false);
    eq(Level.DEBUG.satisfies(Level.ERROR), false);

    eq(Level.INFO.satisfies(Level.TRACE), true);
    eq(Level.INFO.satisfies(Level.DEBUG), true);
    eq(Level.INFO.satisfies(Level.INFO), true);
    eq(Level.INFO.satisfies(Level.WARN), false);
    eq(Level.INFO.satisfies(Level.ERROR), false);

    eq(Level.WARN.satisfies(Level.TRACE), true);
    eq(Level.WARN.satisfies(Level.DEBUG), true);
    eq(Level.WARN.satisfies(Level.INFO), true);
    eq(Level.WARN.satisfies(Level.WARN), true);
    eq(Level.WARN.satisfies(Level.ERROR), false);

    eq(Level.ERROR.satisfies(Level.TRACE), true);
    eq(Level.ERROR.satisfies(Level.DEBUG), true);
    eq(Level.ERROR.satisfies(Level.INFO), true);
    eq(Level.ERROR.satisfies(Level.WARN), true);
    eq(Level.ERROR.satisfies(Level.ERROR), true);
  });

});