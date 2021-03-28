const { EOL } = require('os');
const Level = require('../Level');

const DEFAULT_STREAMS = {
  [Level.TRACE.name]: process.stdout,
  [Level.DEBUG.name]: process.stdout,
  [Level.INFO.name]: process.stdout,
  [Level.WARN.name]: process.stderr,
  [Level.ERROR.name]: process.stderr,
};

module.exports = function(params = {}) {
  const { streams = DEFAULT_STREAMS } = params;
  return function(level, record) {
    const stream = streams[level];
    stream.write(record);
    stream.write(EOL);
  };
};