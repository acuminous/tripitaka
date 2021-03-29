const { strictEqual: eq } = require('assert');
const { Level, processors: { human } } = require('../..');

describe('human', () => {

  it('should work out of the box', () => {
    const fn = human();
    const result = fn({ record: { level: Level.INFO.name, message: 'How blissful it is, for one who has nothing' } });
    eq(result, `[${Level.INFO.name}] How blissful it is, for one who has nothing`);
  });

  it('should work with errors out of the box', () => {
    const fn = human();
    const error = new Error('Oooh, Demons!');
    const result = fn({ record: { level: Level.ERROR.name, message: 'I forbid it!', error: { message: error.message, stack: error.stack } } });
    eq(result, `[${Level.ERROR.name}] I forbid it!`);
  });

  it('should support custom formats', () => {
      const fn = human({ template: '%s %s %d', paths: ['user.firstName', 'user.lastName', 'user.age']});
      const record = { level: Level.INFO.name, message: 'How blissful it is, for one who has nothing', user: { firstName: 'Bob', lastName: 'Holness', age: 63 } };
      const result = fn({ record });
      eq(result, 'Bob Holness 63');
    });
  });