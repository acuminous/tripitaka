module.exports = function(params = {}) {
  const { source } = params;
  return typeof source === 'function' ? augmentFn(source) : augumentObj(source);
};

function augmentFn(fn) {
  return ({ level, message, ctx }) => {
    return { level, message, ctx: { ...fn(), ...ctx } };
  };
}

function augumentObj(obj) {
  return ({ level, message, ctx }) => {
    return { level, message, ctx: { ...obj, ...ctx } };
  };
}