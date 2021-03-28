module.exports = function(arg) {
  return typeof arg === 'function' ? augmentFn(arg) : augumentObj(arg);
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