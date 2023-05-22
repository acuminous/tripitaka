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

  const newLogger = (timestamp) => {
    return new Logger({
      processors: [
        processors.context({ stack: false }),
        processors.timestamp({
          getTimestamp: () => timestamp,
        }),
        processors.empty(),
        processors.json(),
      ],
      transports: [transports.stream({ streams })],
      level: Level.TRACE,
    });
  };

  const errorPosition = "38:24";

  const runScenario = (ts, scenario) => {
    const logger = newLogger(ts);
    logger[scenario.fn](scenario.input.message, scenario.input.context);
    eq(streams[scenario.level.name].lines[0], scenario.expected.line);
  };

  const runScenarios = (ts, scenarios) => {
    for (const scenario of scenarios) {
      it(scenario.name, () => {
        runScenario(ts, scenario);
      });
    }
  };

  const messageScenario = (level, message, context, line, name) => {
    return {
      level,
      fn: level.name.toLocaleLowerCase(),
      name: name === undefined ? level.name.toLocaleLowerCase() : name,
      input: { message, context },
      expected: { line },
    };
  };

  const errorScenario = (msg, context, line, name) => {
    return messageScenario(Level.ERROR, msg, context, line, name);
  };

  const infoScenario = (msg, context, line, name) => {
    return messageScenario(Level.INFO, msg, context, line, name);
  };

  describe("messages", () => {
    const ts = new Date();
    const timestamp = ts.toISOString();

    const messageScenarios = [
      messageScenario(
        Level.TRACE,
        "Tripitaka traces!",
        { x: "y" },
        `{"level":"TRACE","message":"Tripitaka traces!","x":"y","timestamp":"${timestamp}"}`
      ),
      messageScenario(
        Level.DEBUG,
        "Tripitaka debugs!",
        { x: "y" },
        `{"level":"DEBUG","message":"Tripitaka debugs!","x":"y","timestamp":"${timestamp}"}`
      ),
      messageScenario(
        Level.INFO,
        "Tripitaka rocks once!",
        { x: "y" },
        `{"level":"INFO","message":"Tripitaka rocks once!","x":"y","timestamp":"${timestamp}"}`
      ),
      messageScenario(
        Level.WARN,
        "Tripitaka warns!",
        { x: "y" },
        `{"level":"WARN","message":"Tripitaka warns!","x":"y","timestamp":"${timestamp}"}`
      ),
      messageScenario(
        Level.ERROR,
        "Tripitaka errors!",
        new Error("Oooh, Demons!"),
        `{"level":"ERROR","message":"Tripitaka errors!","error":{"message":"Oooh, Demons!"},"timestamp":"${timestamp}"}`
      ),
    ];

    runScenarios(ts, messageScenarios);
  });

  describe("errors", () => {
    const ts = new Date();
    const timestamp = ts.toISOString();

    const errorScenarios = [
      errorScenario(
        "Tripitaka errors!",
        new Error("Oooh, Demons!"),
        `{"level":"ERROR","message":"Tripitaka errors!","error":{"message":"Oooh, Demons!"},"timestamp":"${timestamp}"}`,
        "msg and error"
      ),
      errorScenario(
        "Tripitaka errors!",
        { error: new Error("Oooh, Demons!") },
        `{"level":"ERROR","message":"Tripitaka errors!","error":{"message":"Oooh, Demons!"},"timestamp":"${timestamp}"}`,
        "msg and error object"
      ),
      errorScenario(
        "Tripitaka errors!",
        [new Error("Oooh, Demons!")],
        `{"level":"ERROR","message":"Tripitaka errors!","items":[{"message":"Oooh, Demons!"}],"timestamp":"${timestamp}"}`,
        "msg and error array"
      ),
      errorScenario(
        undefined,
        new Error("Oooh, Demons!"),
        `{"level":"ERROR","message":"Oooh, Demons!","error":{"message":"Oooh, Demons!"},"timestamp":"${timestamp}"}`,
        "error"
      ),
      errorScenario(
        undefined,
        { error: new Error("Oooh, Demons!") },
        `{"level":"ERROR","message":"Empty message logged at runScenario (${__filename}:${errorPosition})","error":{"message":"Oooh, Demons!"},"timestamp":"${timestamp}"}`,
        "error object"
      ),
      errorScenario(
        undefined,
        [new Error("Oooh, Demons!")],
        `{"level":"ERROR","message":"Empty message logged at runScenario (${__filename}:${errorPosition})","items":[{"message":"Oooh, Demons!"}],"timestamp":"${timestamp}"}`,
        "error array"
      ),
      errorScenario(
        undefined,
        undefined,
        `{"level":"ERROR","message":"Empty message logged at runScenario (${__filename}:${errorPosition})","timestamp":"${timestamp}"}`,
        "nothing"
      ),
    ];

    runScenarios(ts, errorScenarios);
  });

  describe("context", () => {
    const ts = new Date();
    const timestamp = ts.toISOString();

    const contextScenarios = [
      infoScenario(
        "Tripitaka rocks!",
        { x: "y" },
        `{"level":"INFO","message":"Tripitaka rocks!","x":"y","timestamp":"${timestamp}"}`,
        "msg and object"
      ),
      infoScenario(
        "Tripitaka rocks!",
        [{ x: "y" }],
        `{"level":"INFO","message":"Tripitaka rocks!","items":[{"x":"y"}],"timestamp":"${timestamp}"}`,
        "msg and array"
      ),
      infoScenario(
        undefined,
        { x: "y" },
        `{"level":"INFO","message":"Empty message logged at runScenario (${__filename}:${errorPosition})","x":"y","timestamp":"${timestamp}"}`,
        "object"
      ),
      infoScenario(
        undefined,
        [{ x: "y" }],
        `{"level":"INFO","message":"Empty message logged at runScenario (${__filename}:${errorPosition})","items":[{"x":"y"}],"timestamp":"${timestamp}"}`,
        "array"
      ),
      infoScenario(
        undefined,
        undefined,
        `{"level":"INFO","message":"Empty message logged at runScenario (${__filename}:${errorPosition})","timestamp":"${timestamp}"}`,
        "nothing"
      ),
    ];

    runScenarios(ts, contextScenarios);
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
      `    at Test._fn (${__filename}:239:18)`
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
