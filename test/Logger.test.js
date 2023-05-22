const { deepStrictEqual: eq, ok } = require("assert");
const { TestOutputStream } = require("./support");
const { Level, Logger, processors, transports } = require("..");

describe("Logger", () => {
  let streams;

  beforeEach(() => {
    /* eslint-disable-next-line no-shadow */
    streams = Object.values(Level).reduce((streams, level) => {
      return { ...streams, [level.name]: new TestOutputStream() };
    }, {});
  });

  afterEach(() => {
    Object.values(streams).forEach((stream) => stream.destroy());
  });

  it("should log messages at all levels", () => {
    const ts = new Date();
    const logger = new Logger({
      processors: [
        processors.context({ stack: false }),
        processors.timestamp({
          getTimestamp: () => ts,
        }),
        processors.empty(),
        processors.json(),
      ],
      transports: [transports.stream({ streams })],
      level: Level.TRACE,
    });

    logger.trace("Tripitaka traces!", { x: "y" });
    logger.debug("Tripitaka debugs!", { x: "y" });
    logger.info("Tripitaka rocks once!", { x: "y" });
    logger.warn("Tripitaka warns!", { x: "y" });
    logger.error("Tripitaka errors!", new Error("Oooh, Demons!"));

    eq(
      streams[Level.TRACE.name].lines[0],
      `{"level":"TRACE","message":"Tripitaka traces!","x":"y","timestamp":"${ts.toISOString()}"}`
    );
    eq(
      streams[Level.DEBUG.name].lines[0],
      `{"level":"DEBUG","message":"Tripitaka debugs!","x":"y","timestamp":"${ts.toISOString()}"}`
    );
    eq(
      streams[Level.INFO.name].lines[0],
      `{"level":"INFO","message":"Tripitaka rocks once!","x":"y","timestamp":"${ts.toISOString()}"}`
    );
    eq(
      streams[Level.WARN.name].lines[0],
      `{"level":"WARN","message":"Tripitaka warns!","x":"y","timestamp":"${ts.toISOString()}"}`
    );
    eq(
      streams[Level.ERROR.name].lines[0],
      `{"level":"ERROR","message":"Tripitaka errors!","error":{"message":"Oooh, Demons!"},"timestamp":"${ts.toISOString()}"}`
    );
  });

  it("should log all variations of errors", () => {
    const ts = new Date();
    const logger = new Logger({
      processors: [
        processors.context({ stack: false }),
        processors.timestamp({
          getTimestamp: () => ts,
        }),
        processors.empty(),
        processors.json(),
      ],
      transports: [transports.stream({ streams })],
      level: Level.TRACE,
    });

    logger.error("Tripitaka errors!", new Error("Oooh, Demons!"));
    logger.error("Tripitaka errors!", { error: new Error("Oooh, Demons!") });
    logger.error("Tripitaka errors!", [new Error("Oooh, Demons!")]);
    logger.error(new Error("Oooh, Demons!"));
    logger.error({ error: new Error("Oooh, Demons!") });
    logger.error([new Error("Oooh, Demons!")]);
    logger.error();

    eq(
      streams[Level.ERROR.name].lines[0],
      `{"level":"ERROR","message":"Tripitaka errors!","error":{"message":"Oooh, Demons!"},"timestamp":"${ts.toISOString()}"}`
    );
    eq(
      streams[Level.ERROR.name].lines[1],
      `{"level":"ERROR","message":"Tripitaka errors!","error":{"message":"Oooh, Demons!"},"timestamp":"${ts.toISOString()}"}`
    );
    eq(
      streams[Level.ERROR.name].lines[2],
      `{"level":"ERROR","message":"Tripitaka errors!","items":[{"message":"Oooh, Demons!"}],"timestamp":"${ts.toISOString()}"}`
    );
    eq(
      streams[Level.ERROR.name].lines[3],
      `{"level":"ERROR","message":"Oooh, Demons!","error":{"message":"Oooh, Demons!"},"timestamp":"${ts.toISOString()}"}`
    );
    eq(
      streams[Level.ERROR.name].lines[4],
      `{"level":"ERROR","message":"Empty message logged at Test._fn (${__filename}:81:12)","error":{"message":"Oooh, Demons!"},"timestamp":"${ts.toISOString()}"}`
    );
    eq(
      streams[Level.ERROR.name].lines[5],
      `{"level":"ERROR","message":"Empty message logged at Test._fn (${__filename}:82:12)","items":[{"message":"Oooh, Demons!"}],"timestamp":"${ts.toISOString()}"}`
    );
    eq(
      streams[Level.ERROR.name].lines[6],
      `{"level":"ERROR","message":"Empty message logged at Test._fn (${__filename}:83:12)","timestamp":"${ts.toISOString()}"}`
    );
    eq(streams[Level.ERROR.name].lines.length, 7);
  });

  it("should log all variations of contexts", () => {
    const ts = new Date();
    const logger = new Logger({
      processors: [
        processors.context({ stack: false }),
        processors.timestamp({
          getTimestamp: () => ts,
        }),
        processors.empty(),
        processors.json(),
      ],
      transports: [transports.stream({ streams })],
      level: Level.TRACE,
    });

    logger.info("Tripitaka rocks!", { x: "y" });
    logger.info("Tripitaka rocks!", [{ x: "y" }]);
    logger.info({ x: "y" });
    logger.info([{ x: "y" }]);
    logger.info();

    eq(
      streams[Level.INFO.name].lines[0],
      `{"level":"INFO","message":"Tripitaka rocks!","x":"y","timestamp":"${ts.toISOString()}"}`
    );
    eq(
      streams[Level.INFO.name].lines[1],
      `{"level":"INFO","message":"Tripitaka rocks!","items":[{"x":"y"}],"timestamp":"${ts.toISOString()}"}`
    );
    eq(
      streams[Level.INFO.name].lines[2],
      `{"level":"INFO","message":"Empty message logged at Test._fn (${__filename}:133:12)","x":"y","timestamp":"${ts.toISOString()}"}`
    );
    eq(
      streams[Level.INFO.name].lines[3],
      `{"level":"INFO","message":"Empty message logged at Test._fn (${__filename}:134:12)","items":[{"x":"y"}],"timestamp":"${ts.toISOString()}"}`
    );
    eq(
      streams[Level.INFO.name].lines[4],
      `{"level":"INFO","message":"Empty message logged at Test._fn (${__filename}:135:12)","timestamp":"${ts.toISOString()}"}`
    );
    eq(streams[Level.INFO.name].lines.length, 5);
  });

  it("should ignore falsy processors", () => {
    const ts = new Date();
    const logger = new Logger({
      processors: [
        processors.context({ stack: false }),
        processors.timestamp({
          getTimestamp: () => ts,
        }),
        () => false,
        () => null,
        () => undefined,
        processors.json(),
      ],
      transports: [transports.stream({ streams })],
    });

    logger.info("Tripitaka rocks!", { x: "y" });

    eq(streams[Level.INFO.name].lines, [
      `{"level":"INFO","message":"Tripitaka rocks!","x":"y","timestamp":"${ts.toISOString()}"}`,
    ]);
  });

  it("should support humans", () => {
    const logger = new Logger({
      processors: [
        processors.context(),
        processors.timestamp({
          getTimestamp: () => new Date("2022-05-29T13:14:15.001Z"),
        }),
        processors.empty(),
        processors.human({ colours: 0 }),
      ],
      transports: [transports.stream({ streams })],
      level: Level.TRACE,
    });

    logger.info("Tripitaka rocks!", { x: "y" });
    logger.info("Tripitaka rocks!");
    logger.error(new Error("Oooh, Demons!"));

    eq(
      streams[Level.INFO.name].lines[0],
      "2022-05-29 13:14:15 INFO  Tripitaka rocks!"
    );
    eq(streams[Level.INFO.name].lines[1], "{");
    eq(streams[Level.INFO.name].lines[2], '  "x": "y"');
    eq(streams[Level.INFO.name].lines[3], "}");
    eq(
      streams[Level.INFO.name].lines[4],
      "2022-05-29 13:14:15 INFO  Tripitaka rocks!"
    );
    eq(streams[Level.INFO.name].lines.length, 5);
    eq(
      streams[Level.ERROR.name].lines[0],
      "2022-05-29 13:14:15 ERROR Oooh, Demons!"
    );
    eq(streams[Level.ERROR.name].lines[1], "Error: Oooh, Demons!");
    eq(
      streams[Level.ERROR.name].lines[2],
      `    at Test._fn (${__filename}:199:18)`
    );

    ok(streams[Level.ERROR.name].lines.length >= 10);
  });

  it("should support being disabled", () => {
    const logger = new Logger({
      transports: [transports.stream({ streams })],
    });

    logger.disable();
    logger.info("Tripitaka rocks!", { x: "y" });
    eq(streams[Level.INFO.name].lines.length, 0);
  });

  it("should support being enabled", () => {
    const logger = new Logger({
      transports: [transports.stream({ streams })],
    });

    logger.disable();
    logger.enable();

    logger.info("Tripitaka rocks!", { x: "y" });
    eq(streams[Level.INFO.name].lines.length, 4);
  });
});
