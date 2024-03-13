const { EOL } = require('os');
const { Writable } = require('stream');

class TestOutputStream extends Writable {
  constructor() {
    super();
    this._chunks = [];
  }

  get lines() {
    return this._chunks.join('').split(EOL).slice(0, -1);
  }

  write(chunk) {
    this._chunks.push(chunk);
  }
}

module.exports = TestOutputStream;
