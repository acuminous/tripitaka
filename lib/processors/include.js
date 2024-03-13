const has = require("has-value");
const get = require("get-value");
const set = require("set-value");
const toPath = require("to-path");

const ALWAYS_PASS = () => true;

module.exports = (params = {}) => {
  const { paths = [], precondition = ALWAYS_PASS } = params;
  return ({ level, message, context, record }) => {
    if (!precondition({ level, message, context, record })) return record;

    const included = paths.reduce((acc, path) => {
      if (!has(record, path, { split: getSplit })) return acc;
      const value = get(record, path, { split: getSplit });
      return set(acc, path, value, { split: setSplit });
    }, {});
    return { ...included };
  };
};

function getSplit(path) {
  return toPath(path).map((p) => (Number.isNaN(Number(p)) ? p : Number(p)));
}

function setSplit(path) {
  return toPath(path);
}
