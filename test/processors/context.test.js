const { strictEqual: eq, ok, match } = require("assert");
const {
  processors: { context },
} = require("../..");

describe("context", () => {
  describe("context is an Error", () => {
    it("should nest the error on the record", () => {
      const fn = context();
      const ctx = new Error("Oooh, Demons!");
      const result = fn({ message: "Oooh, Demons!", ctx });

      eq(result.error.message, "Oooh, Demons!");
      match(result.error.stack, /^Error: Oooh, Demons!/);
    });

    it("should nest with a custom property", () => {
      const fn = context({ errorField: "e" });
      const ctx = new Error("Oooh, Demons!");
      const result = fn({ message: "Oooh, Demons!", ctx });

      eq(result.e.message, "Oooh, Demons!");
      match(result.e.stack, /^Error: Oooh, Demons!/);
    });
  });

  describe("context is an Array", () => {
    it("should nest the array on the record", () => {
      const fn = context();
      const ctx = [1, 2, 3];
      const result = fn({ ctx });

      eq(result.items.length, 3);
      ok(result.items[0], 1);
      ok(result.items[1], 2);
      ok(result.items[2], 3);
    });

    it("should nest with a custom property", () => {
      const fn = context({ arrayField: "things" });
      const ctx = [1, 2, 3];
      const result = fn({ ctx });

      eq(result.things.length, 3);
      ok(result.things[0], 1);
      ok(result.things[1], 2);
      ok(result.things[2], 3);
    });
  });

  describe("context is an Object", () => {
    it("should correctly capture error details when provided via context", () => {
      const fn = context();
      const ctx = { a: "b", error: new Error("Oooh, Demons!"), x: "y" };

      const result = fn({ ctx });

      eq(result.error.message, "Oooh, Demons!");
      match(result.error.stack, /^Error: Oooh, Demons!/);
    });
  });
});
