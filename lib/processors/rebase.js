module.exports = function(params = {}) {
  const { field } = params;
  return ({ level, message, ctx }) => {
    return { [field]: ctx, level, message  };
  };
};