module.exports = function() {
  return ({ level, message, ctx }) => {
    return { ...ctx, message, level };
  };
};