const { ok, strictEqual: eq } = require("assert");
const {
  processors: { buffer },
} = require("../..");

describe("buffer", () => {
  it("should work out of the box", () => {
    const fn = buffer();
    const result = fn({ record: "meh!" });
    ok(result instanceof Buffer);
    eq(result.toString(), "meh!");
  });

  it("should support base64 input", () => {
    const fn = buffer({ inputEncoding: "base64" });
    const result = fn({ record: "bWVoIQ==" });
    eq(result.toString(), "meh!");
  });

  it("should support base64 output", () => {
    const fn = buffer({ outputEncoding: "base64" });
    const result = fn({ record: "meh!" });
    eq(result, "bWVoIQ==");
  });

  it("should support hex output", () => {
    const fn = buffer({ outputEncoding: "hex" });
    const result = fn({ record: "meh!" });
    eq(result, "6d656821");
  });

  it("should support hex input", () => {
    const fn = buffer({ inputEncoding: "hex" });
    const result = fn({ record: "6d656821" });
    eq(result.toString(), "meh!");
  });
});
