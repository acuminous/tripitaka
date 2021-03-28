const Level = require('./Level');
const { error, human, json, timestamp } = require('./processors');
const { stream } = require('./transports');

module.exports = class Logger {

  constructor(params = {}) {
    const {
      processors = [
        error(),
        timestamp(),
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

    Level.decorate(this);
  }

  enable() {
    this._disabled = false;
  }

  disable() {
    this._disabled = true;
  }

  log(level, message, ctx = {}) {
    if (this._disabled || !level.satisfies(this._level)) return;
    const record = this._process(level, message, ctx);
    this._output({ level, record });
  }

  _process(level, message, ctx) {
    return this._processors.reduce((record, processor) => {
      const result = processor({ level, message, ctx, record });
      return result || record;
    }, { level: level.name, message });
  }

  _output(level, record) {
    this._transports.forEach((transport) => {
      transport(level, record);
    });
  }
};