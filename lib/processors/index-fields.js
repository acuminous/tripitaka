const { get, set, has } = require("dot-prop");

module.exports = (params = {}) => {
  const { field = "fields", paths = [], reportComplexTypes = false } = params;
  return ({ record }) => {
    const index = indexFields(paths, record, reportComplexTypes);
    return { ...record, [field]: index };
  };
};

function indexFields(paths, record, reportComplexTypes) {
  return paths.reduce((index, path) => {
    if (!has(record, path)) return index;
    const value = get(record, path);

    if (isInvalidNumber(value)) return index;

    const complex = hasComplexType(value);
    if (complex && reportComplexTypes) throw new Error(`${path} cannot be indexed because it resolves to a complex type`);
    if (complex) return index;

    return set(index, path, value);
  }, {});
}

function isInvalidNumber(value) {
  return typeof value === "number" && (!Number.isFinite(value) || Number.isNaN(value));
}

function hasComplexType(value) {
  if (value === null) return false;
  return ["object", "function", "symbol"].includes(typeof value);
}
