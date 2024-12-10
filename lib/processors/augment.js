module.exports = (params = {}) => {
  const { source } = params;
  return typeof source === 'function' ? augmentFn(source) : augumentObj(source);
};

function augmentFn(fn) {
  return ({ level, message, ctx, record }) => {
    return { ...record, ...fn({ level, message, ctx, record }) };
  };
}

function augumentObj(obj) {
  return ({ record }) => {
    return { ...record, ...obj };
  };
}
