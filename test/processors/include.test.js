const { deepStrictEqual: eq } = require("assert");
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
    const result = fn({ record: { a: [{ b: 1 }, { c: 2 }], m: 1, x: [{ y: 1 }, { z: 2 }] } });
    eq(result, { a: { 0: { b: 1 } }, x: { 1: { z: 2 } } });
  });

  it("should ignore missing paths", () => {
    const fn = include({ paths: ["a.d"] });
    const result = fn({ record: { a: { b: 1, c: 2 } } });
    eq(result, {});
  });

  // See https://github.com/jonschlinkert/get-value/issues/29
  // it("should work with recursive documents", () => {
  //   const fn = include({ paths: ["a.b.c"] });
  //   const a = { c: 2 };
  //   a.b = a;
  //   const result = fn({ record: a });
  //   eq(result, { a: { b: { c: 2 } } });
  // });

  it("should not mutate original record", () => {
    const record = { a: { b: 1, c: 2 }, m: 1, x: { y: 1, z: 2 } };
    const fn = include({ paths: ["a.b", "x"] });
    fn({ record });
    eq(record, { a: { b: 1, c: 2 }, m: 1, x: { y: 1, z: 2 } });
  });

  it("should run the processor the precondition passes", () => {
    const fn = include({ precondition: ({ record }) => record.a.b === 1, paths: ["a.b", "x"] });
    const result = fn({ record: { a: { b: 1, c: 2 }, m: 1, x: { y: 1, z: 2 } } });
    eq(result, { a: { b: 1 }, x: { y: 1, z: 2 } });
  });

  it("should bypass the processor the precondition fails", () => {
    const fn = include({ precondition: () => false, paths: ["a.b", "x"] });
    const result = fn({ record: { a: { b: 1, c: 2 }, m: 1, x: { y: 1, z: 2 } } });
    eq(result, { a: { b: 1, c: 2 }, m: 1, x: { y: 1, z: 2 } });
  });
});
