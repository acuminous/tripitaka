module.exports = function(params = {}) {
  const { errorField = 'error', stack = true } = params;
  return ({ message, ctx, record }) => {
    if (message instanceof Error) return mapMessage(record, message, errorField, stack);
    if (ctx instanceof Error) return mapContext(record, ctx, errorField, stack);
    return mapProperties(record, ctx, stack);
  };
};

function mapMessage(record, error, errorField, stack) {
  return { ...record, message: error.message, [errorField]: mapError(error, stack) };
}

function mapContext(record, error, errorField, stack) {
  return { ...record, [errorField]: mapError(error, stack) };
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
