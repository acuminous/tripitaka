const { EOL } = require('os');
const { has, get } = require('dot-prop');

module.exports = function() {
  return ({ record }) => {
    const timestamp = get(record, 'timestamp', new Date()).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    let msg = `${timestamp} [${record.level}] ${record.message}`;
    if (has(record, 'error.stack')) msg += `${EOL}${record.error.stack}`;
    return msg;
  };
};
