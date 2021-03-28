module.exports = function(params = {}) {
  const { field = 'error', stack = true } = params;
  return ({ level, message, ctx }) => {
    if (message instanceof Error) return mapMessage(level, message, field, stack);
    if (ctx instanceof Error) return mapContext(level, message, ctx, field, stack);
    return Object.entries(ctx).reduce((record, [name, value]) => {
      const mapped = value instanceof Error ? mapError(value, stack) : value;
      return { level, message, ctx: { ...record.ctx, [name]: mapped } };
    }, { level, message, ctx: {} });
  };
};

function mapMessage(level, error, field, stack) {
  return { level, message: error.message, ctx: { [field]: mapError(error, stack) } }
}

function mapContext(level, message, error, field, stack) {
  return { level, message, ctx: { [field]: mapError(error, stack) } };
}

function mapError(error, stack) {
  return Object.getOwnPropertyNames(error).reduce((acc, name) => {
    if (name === 'stack' && !stack) return acc;
    return Object.assign(acc, { [name]: error[name] });
  }, {});
}
