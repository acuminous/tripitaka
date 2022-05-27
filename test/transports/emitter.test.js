const { deepStrictEqual: eq, fail } = require("assert");
const { EventEmitter } = require("events");
const {
  Level,
  transports: { emitter },
} = require("../..");

describe("emitter", () => {
  it("should work out of the box", () => {
    const fn = emitter();
    process.once("log", (record) => {
      eq(record, { x: "y" });
    });

    fn({ level: Level.INFO, record: { x: "y" } });
  });

  it("should use the specified event", () => {
    const fn = emitter({
      events: {
        [Level.INFO.name]: "info",
      },
    });

    process.once("info", (record) => {
      eq(record, { x: "y" });
    });

    fn({ level: Level.INFO, record: { x: "y" } });
  });

  it("should use the specified emitter", () => {
    const eventEmitter = new EventEmitter();
    const fn = emitter({ emitter: eventEmitter });

    eventEmitter.once("log", (record) => {
      eq(record, { x: "y" });
    });

    fn({ level: Level.INFO, record: { x: "y" } });
  });

  it("should adhere to the specified logging level", () => {
    const fn = emitter({ level: Level.ERROR });

    process.once("log", () => {
      fail("Logging level was ignored");
    });

    fn({ level: Level.INFO, record: { x: "y" } });
  });
});
