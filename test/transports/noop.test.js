const {
  Level,
  transports: { noop },
} = require('../..');

describe('noop', () => {
  it('should work out of the box', () => {
    const fn = noop();
    fn({ level: Level.INFO, record: 'NOTHING TO SEE HERE' });
    fn({ level: Level.ERROR, record: 'NOTHING TO SEE HERE' });
  });
});
