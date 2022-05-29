const Level = require("./Level");
const { context, human, json, timestamp } = require("./processors");
const { stream } = require("./transports");

module.exports = class Logger {
  constructor(params = {}) {
    const {
      processors = [
        context(),
        timestamp(),
        process.env.NODE_ENV === "production" ? json() : human(),
      ],
      transports = [stream()],
      level = Level.INFO,
    } = params;

    this._processors = processors;
    this._transports = transports;
    this._threshold = level;
    this._disabled = false;

    Level.decorate(this);
  }

  enable() {
    this._disabled = false;
  }

  disable() {
    this._disabled = true;
  }

  log(level, ...args) {
    if (this._disabled || !level.satisfies(this._threshold)) return;

    let message,
      ctx = {};
    if (args[1] !== undefined) {
      [message, ctx] = args;
    } else if (args[0] instanceof String) {
      message = args[0];
    } else {
      ctx = args[0] || {};
    }

    const record = this._process({ level, message, ctx });
    this._output({ level, record });
  }

  _process({ level, message, ctx }) {
    return this._processors.reduce(
      (record, processor) => {
        const result = processor({ level, message, ctx, record });
        return result || record;
      },
      { level: level.name, message }
    );
  }

  _output(level, record) {
    this._transports.forEach((transport) => {
      transport(level, record);
    });
  }
};
