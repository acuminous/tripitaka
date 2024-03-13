module.exports = (params = {}) => {
  const { source } = params;
  return typeof source === 'function' ? augmentFn(source) : augumentObj(source);
};

function augmentFn(fn) {
  return ({ record }) => {
    return { ...record, ...fn() };
  };
}

function augumentObj(obj) {
  return ({ record }) => {
    return { ...record, ...obj };
  };
}
