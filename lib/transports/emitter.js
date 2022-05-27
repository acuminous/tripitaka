const Level = require("../Level");

const DEFAULT_EVENTS = {
  [Level.TRACE.name]: "log",
  [Level.DEBUG.name]: "log",
  [Level.INFO.name]: "log",
  [Level.WARN.name]: "log",
  [Level.ERROR.name]: "log",
};

module.exports = (params = {}) => {
  const {
    emitter = process,
    events = DEFAULT_EVENTS,
    level: threshold = Level.TRACE,
  } = params;
  return ({ level, record }) => {
    if (!level.satisfies(threshold)) return;
    const event = events[level.name];
    emitter.emit(event, record);
  };
};
