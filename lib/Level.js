class Level {
  constructor({ name, method, value }) {
    this._name = name;
    this._method = method;
    this._value = value;
  }

  static decorate(logger) {
    Level.LEVELS.forEach((level) => level._decorate(logger));
  }

  get name() {
    return this._name;
  }

  static lookup(name) {
    return Level.LEVELS.find((level) => level.name === name);
  }

  equals(other) {
    return other._value === this._value;
  }

  satisfies(other) {
    return other.compareValue(this._value) >= 0;
  }

  compareValue(value) {
    return value - this._value;
  }

  _decorate(logger) {
    /* eslint-disable-next-line no-param-reassign */
    logger[this._method] = (message, ctx) => logger.log(this, message, ctx);
  }
}

Level.TRACE = new Level({ name: 'TRACE', method: 'trace', value: 100 });
Level.DEBUG = new Level({ name: 'DEBUG', method: 'debug', value: 200 });
Level.INFO = new Level({ name: 'INFO', method: 'info', value: 300 });
Level.WARN = new Level({ name: 'WARN', method: 'warn', value: 400 });
Level.ERROR = new Level({ name: 'ERROR', method: 'error', value: 500 });

Level.LEVELS = [Level.TRACE, Level.DEBUG, Level.INFO, Level.WARN, Level.ERROR];

module.exports = Level;
