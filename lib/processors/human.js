const { EOL } = require('os');
const { has, get } = require('dot-prop');

module.exports = function() {
  return ({ record }) => {
    const timestamp = get(record, 'timestamp', new Date()).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const message = get(record, 'error.message', record.message);
    let msg = `${timestamp} [${record.level}] ${message}`;
    if (has(record, 'error.stack')) msg += `${EOL}${record.error.stack}`;
    return msg;
  };
};
