const has = require('has-value');
const get = require('get-value');
const set = require('set-value');
const toPath = require('to-path');
const clone = require('rfdc')({ circles: true });

const ALWAYS_PASS = () => true;

module.exports = (params = {}) => {
  return params.basePath === undefined ? include(params) : includeBasePath(params);
};

function include(params) {
  const { paths = [], precondition = ALWAYS_PASS } = params;
  return ({ level, message, ctx, record }) => {
    if (!precondition({ level, message, ctx, record })) return record;
    return getPatch(paths, record);
  };
}

function includeBasePath(params) {
  const { basePath, paths = [], precondition = ALWAYS_PASS } = params;
  return ({ level, message, ctx, record }) => {
    if (!precondition({ level, message, ctx, record })) return record;
    if (!has(record, basePath, { split: objectsAndArrays })) return record;

    const target = get(record, basePath, { split: objectsAndArrays });
    const patch = getPatch(paths, target);
    return applyPatch(record, basePath, patch);
  };
}

function objectsAndArrays(path) {
  return toPath(path).map((p) => (Number.isNaN(Number(p)) ? p : Number(p)));
}

function objectsOnly(path) {
  return toPath(path);
}

function getPatch(paths, record) {
  return paths.reduce((acc, path) => {
    if (!has(record, path, { split: objectsAndArrays })) return acc;
    const value = get(record, path, { split: objectsAndArrays });
    return set(acc, path, value, { split: objectsOnly });
  }, {});
}

function applyPatch(record, basePath, patch) {
  return set(clone(record), basePath, patch, { split: objectsOnly });
}
