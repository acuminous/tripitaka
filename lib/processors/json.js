const stringify = require('json-stringify-safe');

const DEFAULT_DECYCLER = () => {};

module.exports = (params = {}) => {
  const { serializer = null, indent, decycler = DEFAULT_DECYCLER } = params;
  return ({ record }) => {
    return stringify(record, serializer, indent, decycler);
  };
};
