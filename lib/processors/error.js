module.exports = function(params = {}) {
  const { field = 'error', stack = true } = params;
  return ({ message, ctx, record }) => {
    if (message instanceof Error) return mapMessage(record, message, field, stack);
    if (ctx instanceof Error) return mapContext(record, ctx, field, stack);
    return mapProperties(record, ctx, stack);
  };
};

function mapMessage(record, error, field, stack) {
  return { message: error.message, [field]: mapError(error, stack), ...record };
}

function mapContext(record, error, field, stack) {
  return { [field]: mapError(error, stack), ...record };
}

function mapProperties(record, ctx, stack) {
  return Object.entries(ctx).reduce((record, [name, value]) => {
    const mapped = value instanceof Error ? mapError(value, stack) : value;
    return { ...record, [name]: mapped };
  }, record);
}

function mapError(error, stack) {
  return Object.getOwnPropertyNames(error).reduce((acc, name) => {
    if (name === 'stack' && !stack) return acc;
    return Object.assign(acc, { [name]: error[name] });
  }, {});
}
