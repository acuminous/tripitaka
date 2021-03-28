const Level = require('../Level');

const DEFAULT_EVENTS = {
  [Level.TRACE.name]: 'log',
  [Level.DEBUG.name]: 'log',
  [Level.INFO.name]: 'log',
  [Level.WARN.name]: 'log',
  [Level.ERROR.name]: 'log',
};

module.exports = function(params = {}) {
  const { emitter = process, events = DEFAULT_EVENTS } = params;
  return function({ level, record }) {
    const event = events[level.name];
    emitter.emit(event, record);
  };
};