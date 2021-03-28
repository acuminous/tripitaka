const { strictEqual: eq } = require('assert');
const { Level, processors: { human } } = require('../..');

describe('human', () => {

  it('should work out of the box', () => {
    const fn = human();
    const result = fn({ record: { level: Level.INFO.name, message: 'ZenLog Rocks!' } });
    eq(result, `[${Level.INFO.name}] ZenLog Rocks!`);
  });

  it('should work with errors out of the box', () => {
    const fn = human();
    const error = new Error('Oh Noes!');
    const result = fn({ record: { level: Level.ERROR.name, message: 'ZenLog Errors!', error: { message: error.message, stack: error.stack } } });
    eq(result, `[${Level.ERROR.name}] ZenLog Errors!`);
  });

  it('should support custom formats', () => {
      const fn = human({ template: '%s %s %d', paths: ['user.firstName', 'user.lastName', 'user.age']});
      const record = { level: Level.INFO.name, message: 'ZenLog Rocks!', user: { firstName: 'Bob', lastName: 'Holness', age: 63 } };
      const result = fn({ record });
      eq(result, 'Bob Holness 63');
    });
  });