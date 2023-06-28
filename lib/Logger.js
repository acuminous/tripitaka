const Level = require("./Level");
const { context, human, json, timestamp } = require("./processors");
const { stream } = require("./transports");

module.exports = class Logger {
  constructor(params = {}) {
    const {
      processors = [context(), timestamp(), process.env.NODE_ENV === "production" ? json() : human()],
      transports = [stream()],
      level = Level.INFO,
    } = params;

    this._processors = processors;
    this._transports = transports;
    this._threshold = level;
    this._disabled = false;
    this._promises = new Set();
    this._draining = null;

    Level.decorate(this);
  }

  enable() {
    this._disabled = false;
  }

  disable() {
    this._disabled = true;
  }

  log(level, ...args) {
    if (this._draining || this._disabled || !level.satisfies(this._threshold)) return;

    let message;
    let ctx = {};
    if (args[1] !== undefined) {
      [message, ctx] = args;
    } else if (typeof args[0] === "string") {
      message = args[0];
    } else {
      ctx = args[0] || {};
    }

    const record = this._process({ level, message, ctx });
    this._output({ level, record });
  }

  drain(timeout) {
    this._draining =
      this._draining ||
      new Promise((resolve, reject) => {
        const timerId =
          timeout &&
          setTimeout(() => {
            reject(new Error("Timedout waiting for logger to drain"));
          });
        const waitUntilDrained = () => {
          if (this._promises.size > 0) return setTimeout(waitUntilDrained, 10).unref();
          clearTimeout(timerId);
          resolve();
        };
        waitUntilDrained();
      });

    return this._draining;
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
      const p = transport(level, record) || Promise.resolve();
      this._promises.add(p);
      p.then(() => this._promises.delete(p));
    });
  }
};
