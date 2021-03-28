const { deepStrictEqual: eq } = require('assert');
const { TestOutputStream }  = require('../support');
const { Level, transports: { stream } } = require('../..');

describe('stream', () => {

  it('should work out of the box', () => {
    const fn = stream();
    fn({ level: Level.INFO, record: '' });
    fn({ level: Level.ERROR, record: '' });
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
      fn({ level: Level.INFO, record: 'Nothing to see here' });
      fn({ level: Level.ERROR, record: 'Oh Noes!' });

      eq(info.lines, ['Nothing to see here']);
      eq(error.lines, ['Oh Noes!']);
    } finally {
      info.destroy();
      error.destroy();
    }
  });
});