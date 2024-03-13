const { deepStrictEqual: eq, throws } = require("assert");
const {
  processors: { include },
} = require("../..");

describe("include", () => {
  it("should only include the specified object paths", () => {
    const fn = include({ paths: ["a.b", "x"] });
    const result = fn({ record: { a: { b: 1, c: 2 }, m: 1, x: { y: 1, z: 2 } } });
    eq(result, { a: { b: 1 }, x: { y: 1, z: 2 } });
  });

  it("should only include the specified array paths", () => {
    const fn = include({ paths: ["a[0].b", "x[1]"] });
    const result = fn({ record: { a: [ { b: 1 }, { c: 2 }], m: 1, x: [ { y: 1 } , { z: 2 }]} });
    eq(result, { a: [{ b: 1 }], x: [{ z: 2 }] });
  });

  it("should tolerate missing paths", () => {
  });

  it("should tolerate recursive documents", () => {
  });

  it("should not mutate original record", () => {
  });
}, { exclusive: true });
