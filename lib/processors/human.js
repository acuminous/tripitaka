const { EOL } = require("os");
const has = require("has-value");
const Chalk = require("chalk");
const stringify = require("json-stringify-safe");
const Level = require("../Level");

const DEFAULT_DECYCLER = () => {};

module.exports = (params = {}) => {
  const { serializer = null, indent = 2, decycler = DEFAULT_DECYCLER, colours } = params;
  const chalk = new Chalk.Instance({ level: colours });
  return ({ record }) => {
    const { level, timestamp = new Date(), message } = record;

    const timestampText = chalk.underline(timestamp.toISOString().replace(/T/, " ").replace(/\..+/, ""));

    let levelText;

    switch (Level.lookup(level)) {
      case Level.ERROR: {
        levelText = chalk.redBright(level);
        break;
      }
      case Level.WARN: {
        levelText = chalk.yellow(level.padEnd(5));
        break;
      }
      default: {
        levelText = chalk.green(level.padEnd(5));
      }
    }

    let msg = `${timestampText} ${levelText} ${message}`;

    const ctx = {};
    for (const [key, value] of Object.entries(record)) {
      if (has(value, "stack")) msg += `${EOL}${value.stack}`;
      else if (["timestamp", "level", "message"].includes(key)) continue;
      else {
        ctx[key] = value;
      }
    }
    if (Object.keys(ctx).length > 0) {
      const contextText = stringify(ctx, serializer, indent, decycler);
      msg += `${EOL}${contextText}`;
    }
    return msg;
  };
};
