const { deepStrictEqual: eq, throws } = require("assert");
const {
  processors: { index },
} = require("../..");

describe("index", () => {
  it("should index the specified paths", () => {
    const fn = index({ paths: ["a.b", "x"] });
    const result = fn({ record: { a: { b: 1, c: 2 }, x: 3 } });
    eq(result, { a: { b: 1, c: 2 }, x: 3, fields: { a: { b: 1 }, x: 3 } });
  });

  it("should use the specified key", () => {
    const fn = index({ field: "index", paths: ["a.b", "x"] });
    const result = fn({ record: { a: { b: 1, c: 2 }, x: 3 } });
    eq(result, { a: { b: 1, c: 2 }, x: 3, index: { a: { b: 1 }, x: 3 } });
  });

  it("should tolerate missing paths", () => {
    const fn = index({ paths: ["a.b", "x"] });
    const result = fn({ record: { x: 3 } });
    eq(result, { x: 3, fields: { x: 3 } });
  });

  it("should ignore complex types", () => {
    const fn = index({ paths: ["a", "x"] });
    const result = fn({ record: { a: { b: 1, c: 2 }, x: [3] } });
    eq(result, { a: { b: 1, c: 2 }, x: [3], fields: {} });
  });

  it("should ignore NaN values", () => {
    const fn = index({ paths: ["a.b", "x"] });
    const nan = Number("x");
    const result = fn({ record: { a: { b: nan, c: 2 }, x: 3 } });
    eq(result, { a: { b: nan, c: 2 }, x: 3, fields: { x: 3 } });
  });

  it("should ignore infinite values", () => {
    const fn = index({ paths: ["a.b", "x"] });
    const infinity = 1 / 0;
    const result = fn({ record: { a: { b: infinity, c: 2 }, x: 3 } });
    eq(result, { a: { b: infinity, c: 2 }, x: 3, fields: { x: 3 } });
  });

  it("should report object when instructed", () => {
    const fn = index({ paths: ["a"], reportComplexTypes: true });
    throws(() => {
      fn({ record: { a: { b: 1, c: 2 } } });
    }, /a cannot be indexed because it resolves to a complex type/);
  });

  it("should report arrays when instructed", () => {
    const fn = index({ paths: ["a"], reportComplexTypes: true });
    throws(() => {
      fn({ record: { a: [1] } });
    }, /a cannot be indexed because it resolves to a complex type/);
  });

  it("should report functions when instructed", () => {
    const fn = index({ paths: ["a"], reportComplexTypes: true });
    throws(() => {
      /* eslint-disable-next-line no-empty-function */
      fn({ record: { a: () => {} } });
    }, /a cannot be indexed because it resolves to a complex type/);
  });
});
