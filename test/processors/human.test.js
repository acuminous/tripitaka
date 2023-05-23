const { match } = require("assert");
const {
  Level,
  processors: { human },
} = require("../..");

describe("human", () => {
  it("should work out of the box", () => {
    const fn = human({ colours: 0 });
    const result = fn({
      record: {
        level: Level.INFO.name,
        message: "How blissful it is, for one who has nothing",
      },
    });

    match(result, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} INFO  How blissful it is, for one who has nothing$/);
  });

  it("should work with errors", () => {
    const fn = human({ colours: 0 });
    const error = new Error("Oooh, Demons!");
    const result = fn({
      record: {
        level: Level.ERROR.name,
        message: "I forbid it!",
        error: { message: error.message, stack: error.stack },
      },
    });
    match(result, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} ERROR I forbid it!/);
    match(result, /Error: Oooh, Demons!/);
  });
});
