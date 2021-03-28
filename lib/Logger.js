const Level = require('./Level');
const { condense, error, human, json, timestamp } = require('./processors');
const { stream } = require('./transports');

module.exports = class Logger {

  constructor(params = {}) {
    const {
      processors = [
        error(),
        timestamp(),
        condense(),
        process.env.NODE_ENV === 'production' ? json() : human(),
      ],
      transports = [
        stream(),
      ],
      level = Level.INFO,
     } = params;

    this._processors = processors;
    this._transports = transports;
    this._level = level;
    this._disabled = false;

    Object.values(Level).forEach(level => {
      this[level.method] = function(message, ctx) {
        this._log(level, message, ctx);
      };
    });
  }

  enable() {
    this._disabled = false;
  }

  disable() {
    this._disabled = true;
  }

  _log(level, message, ctx = {}) {
    if (this._disabled || level.value < this._level.value) return;
    const record = this._process(level.name, message, ctx);
    this._output({ level, record });
  }

  _process(level, message, ctx) {
    return this._processors.reduce((record, processor) => {
      const result = processor(record);
      return result || record;
    }, { level, message, ctx });
  }

  _output(level, record) {
    this._transports.forEach((transport) => {
      transport(level, record);
    });
  }
};