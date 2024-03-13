module.exports = (params = {}) => {
  const { arrayField = 'items', errorField = 'error', stack = true } = params;
  return ({ record, message, ctx }) => {
    if (ctx instanceof Error) return mapContext(record, message, ctx, errorField, stack);
    if (ctx instanceof Array) return mapArray(record, ctx, arrayField, stack);
    return mapProperties(record, ctx, stack);
  };
};

function mapContext(record, message, error, errorField, stack) {
  return {
    ...record,
    message: message === undefined ? error.message : message,
    [errorField]: mapError(error, stack),
  };
}

function mapArray(record, ctx, arrayField, stack) {
  return {
    ...record,
    [arrayField]: ctx.map((value) => {
      return value instanceof Error ? mapError(value, stack) : value;
    }),
  };
}

function mapProperties(record, ctx, stack) {
  return Object.entries(ctx).reduce((acc, [name, value]) => {
    const mapped = value instanceof Error ? mapError(value, stack) : value;
    return { ...acc, [name]: mapped };
  }, record);
}

function mapError(error, stack) {
  return Object.getOwnPropertyNames(error).reduce((acc, name) => {
    if (name === 'stack' && !stack) return acc;
    return Object.assign(acc, { [name]: error[name] });
  }, {});
}
