module.exports = (params = {}) => {
  const { index = 7 } = params;
  return ({ record }) => {
    if (record.message || record.message === 0) return record;
    const target = {};
    Error.captureStackTrace(target);
    const lines = target.stack.split(/\n/);
    return {
      ...record,
      message: `Empty message logged ${lines[index].trim()}`,
    };
  };
};
