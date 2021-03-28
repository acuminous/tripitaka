const { deepStrictEqual: eq } = require('assert');
const { TestOutputStream }  = require('../support');
const { Level, transports: { stream } } = require('../..');

describe('stream', () => {

  it('should work out of the box', () => {
    const fn = stream();
    fn(Level.INFO.name, '');
    fn(Level.ERROR.name, '');
  });

  it('should use the specified streams', () => {
    const info = new TestOutputStream();
    const error = new TestOutputStream();
    try {
      const fn = stream({
        streams: {
          [Level.INFO.name]: info,
          [Level.ERROR.name]: error,
        }
      });
      fn(Level.INFO.name, 'Nothing to see here');
      fn(Level.ERROR.name, 'Oh Noes!');

      eq(info.lines, ['Nothing to see here']);
      eq(error.lines, ['Oh Noes!']);
    } finally {
      info.destroy();
      error.destroy();
    }
  });
});