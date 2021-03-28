module.exports = function(params = {}) {
  const { field = 'error', stack = true } = params;
  return ({ level, message, ctx }) => {
    if (message instanceof Error) return { level, ctx: { [field]: mapError(message, stack) } };
    if (ctx instanceof Error) return { level, message, ctx: { [field]: mapError(ctx, stack) } };
    return Object.entries(ctx).reduce((record, [name, value]) => {
      const mapped = value instanceof Error ? mapError(value, stack) : value;
      return { level, message, ctx: { ...record.ctx, [name]: mapped } };
    }, { level, message, ctx: {} });
  };
};

function mapError(error, stack) {
  return Object.getOwnPropertyNames(error).reduce((acc, name) => {
    if (name === 'stack' && !stack) return acc;
    return Object.assign(acc, { [name]: error[name] });
  }, {});
}
