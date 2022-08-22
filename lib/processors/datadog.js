const tracer = require("dd-trace");
const formats = require("dd-trace/ext/formats");

module.exports = function () {
  return ({ record }) => {
    const span = tracer.scope().active();
    if (span) {
      tracer.inject(span.context(), formats.LOG, record);
    }
    return record;
  };
};
