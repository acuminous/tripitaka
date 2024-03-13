const DEFAULT_GET_TIMESTAMP = () => {
  return new Date();
};

module.exports = (params = {}) => {
  const { field = 'timestamp', getTimestamp = DEFAULT_GET_TIMESTAMP } = params;
  return ({ record }) => {
    return { ...record, [field]: getTimestamp() };
  };
};
