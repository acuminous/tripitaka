const stringify = require('json-stringify-safe');

const DEFAULT_DECYCLER = () => {};

module.exports = (params = {}) => {
  return ({ record }) => {
    const { serializer = null, indent, decycler = DEFAULT_DECYCLER } = params;
    return stringify(record, serializer, indent, decycler);
  };
};
