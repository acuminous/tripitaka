module.exports = function (params = {}) {
  if (!process.env.TRIPITAKA_DISABLE_DEPRECATION_WARNINGS) {
    console.warn(
      "The error processor has been deprecated. See https://github.com/acuminous/tripitaka/issues/8"
    );
  }
  const { field = "error", stack = true } = params;
  return ({ message, ctx, record }) => {
    if (message instanceof Error)
      return mapMessage(record, message, field, stack);
    if (ctx instanceof Error) return mapContext(record, ctx, field, stack);
    return mapProperties(record, ctx, stack);
  };
};

function mapMessage(record, error, field, stack) {
  return { ...record, message: error.message, [field]: mapError(error, stack) };
}

function mapContext(record, error, field, stack) {
  return { ...record, [field]: mapError(error, stack) };
}

function mapProperties(record, ctx, stack) {
  return Object.entries(ctx).reduce((record, [name, value]) => {
    const mapped = value instanceof Error ? mapError(value, stack) : value;
    return { ...record, [name]: mapped };
  }, record);
}

function mapError(error, stack) {
  return Object.getOwnPropertyNames(error).reduce((acc, name) => {
    if (name === "stack" && !stack) return acc;
    return Object.assign(acc, { [name]: error[name] });
  }, {});
}
