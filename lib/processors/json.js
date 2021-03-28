const stringify = require('json-stringify-safe');

/* eslint-disable-next-line no-empty-function */
const DEFAULT_DECYLER = () => {};

module.exports = function(params = {}) {
  const { serializer = null, indent, decycler = DEFAULT_DECYLER } = params;
  return (record) => {
    return stringify(record, serializer, indent, decycler);
  };
};
