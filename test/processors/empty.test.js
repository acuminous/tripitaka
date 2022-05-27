const { match } = require("assert");
const {
  processors: { empty },
} = require("../..");

describe("empty", () => {
  it("should work out of the box", () => {
    const fn = empty({ index: 2 });
    const result = fn({ record: {} });
    match(
      result.message,
      /^Empty message logged at .*\/test\/processors\/empty.test.js:\d+:\d+/
    );
  });
});
