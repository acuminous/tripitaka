const { deepStrictEqual: eq } = require('assert');
const { TestOutputStream } = require('../support');
const {
  Level,
  transports: { stream },
} = require('../..');

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
        },
      });
      fn({ level: Level.INFO, record: 'Nothing to see here' });
      fn({ level: Level.ERROR, record: 'Oooh, Demons!' });

      eq(info.lines, ['Nothing to see here']);
      eq(error.lines, ['Oooh, Demons!']);
    } finally {
      info.destroy();
      error.destroy();
    }
  });

  it('should adhere to the specified logging level', () => {
    const info = new TestOutputStream();

    try {
      const fn = stream({
        level: Level.ERROR,
        streams: {
          [Level.INFO.name]: info,
        },
      });
      fn({ level: Level.INFO, record: 'Nothing to see here' });

      eq(info.lines.length, 0);
    } finally {
      info.destroy();
    }
  });
});
