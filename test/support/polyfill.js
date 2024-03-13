const { EOL } = require('os');
const assert = require('assert');

if (!assert.match) {
  assert.match = function match(actual, regexp) {
    assert.ok(regexp.test(actual), `The input did not match the regular expression ${regexp}. Input:${EOL}${actual}`);
  };
}
