const DEFAULT_GET_TIMESTAMP = () => {return new Date();};

module.exports = function(params = {}) {
  const { field = 'timestamp', getTimestamp = DEFAULT_GET_TIMESTAMP } = params;
  return ({ level, message, ctx }) => {
    return { level, message, ctx: { ...ctx, [field]: getTimestamp() } };
  };
};