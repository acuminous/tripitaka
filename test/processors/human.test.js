const { strictEqual: eq } = require('assert');
const { Level, processors: { human } } = require('../..');

describe('human', () => {

  const level = Level.INFO.name;
  const message = 'ZenLog rocks!';

  it('should work out of the box', () => {
    const timestamp = new Date();
    const fn = human();
    const ctx = { timestamp };
    const result = fn({ level, message, ctx });
    eq(result, `${timestamp.toISOString()} [${Level.INFO.name}] ${message}`);
  });

  it('should support custom formats', () => {
    const fn = human({ template: '%s %s %d', paths: ['ctx.user.firstName', 'ctx.user.lastName', 'ctx.user.age']});
    const ctx = { user: { firstName: 'Bob', lastName: 'Holness', age: 63 } };
    const result = fn({ level, message, ctx });
    eq(result, 'Bob Holness 63');
  });
});