module.exports = (params = {}) => {
  const { outputEncoding, inputEncoding } = params;
  return ({ record }) => {
    const buffer = Buffer.from(record, inputEncoding);
    return outputEncoding ? buffer.toString(outputEncoding) : buffer;
  };
};
