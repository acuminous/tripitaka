module.exports = class Level {
  constructor({ name, method, value }) {
    this._name = name;
    this._method = method;
    this._value = value;
  }

  static TRACE = new Level({ name: 'TRACE', method: 'trace', value: 100 });
  static DEBUG = new Level({ name: 'DEBUG', method: 'debug', value: 200 });
  static INFO = new Level({ name: 'INFO', method: 'info', value: 300 });
  static WARN = new Level({ name: 'WARN', method: 'warn', value: 400 });
  static ERROR = new Level({ name: 'ERROR', method: 'error', value: 500 });

  static decorate(logger) {
    [Level.TRACE, Level.DEBUG, Level.INFO, Level.WARN, Level.ERROR].forEach(level => {
      return level._decorate(logger);
    });
  }

  get name() {
    return this._name;
  }

  satisfies(other) {
    return other.compareValue(this._value) >= 0;
  }

  compareValue(value) {
    return value - this._value;
  }

  _decorate(logger) {
    logger[this._method] = (message, ctx) => {
      logger.log(this, message, ctx);
    };
  }
};