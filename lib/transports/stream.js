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
  const { streams = DEFAULT_STREAMS, level: threshold = Level.TRACE } = params;
  return function({ level, record }) {
    if (!level.satisfies(threshold)) return;
    const stream = streams[level.name];
    stream.write(record);
    stream.write(EOL);
  };
};