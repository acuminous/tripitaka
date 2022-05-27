module.exports = function(params = {}) {
  const { index = 7 } = params;
  return ({ message, record }) => {
    if (message || message === 0) return record;
    const target = {};
    Error.captureStackTrace(target);
    const lines = target.stack.split(/\n/);
    return { ...record, message: `Empty message logged ${lines[index].trim()}`};
  };
};