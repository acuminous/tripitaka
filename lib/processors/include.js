const { get, set, has } = require("dot-prop");

module.exports = (params = {}) => {
  const { paths = [] } = params;
  return ({ record }) => {
    const included = paths.reduce((acc, path) => {
      const value = get(record, path);
      console.log('Setting', path, value)
      return set(acc, path, value);
    }, {});
    return { ...included };
  };
};

