const { EOL } = require('os');

module.exports = function() {
  return ({ record }) => {
    const timestamp = (record.timestamp || new Date()).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const message = record.error && record.error.message ? record.error.message : record.message;
    let msg = `${timestamp} [${record.level}] ${message}`;
    if (record.error && record.error.stack) {
      msg += `${EOL}${record.error.stack}`;
    }
    return msg;
  };
};
