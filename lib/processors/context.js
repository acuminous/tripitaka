module.exports = function() {
  return ({ ctx, record }) => {
    if (ctx instanceof Error) return;
    return Object.entries(ctx).reduce((record, [name, value]) => {
      return { ...record, [name]: value };
    }, record);
  };
};