# Tripitaka

[![Node.js CI](https://github.com/acuminous/tripitaka/workflows/Node.js%20CI/badge.svg)](https://github.com/acuminous/tripitaka/actions?query=workflow%3A%22Node.js+CI%22)
[![NPM version](https://img.shields.io/npm/v/tripitaka.svg?style=flat-square)](https://www.npmjs.com/package/tripitaka)
[![NPM downloads](https://img.shields.io/npm/dm/tripitaka.svg?style=flat-square)](https://www.npmjs.com/package/tripitaka)
[![Maintainability](https://api.codeclimate.com/v1/badges/7321a236e3d434fe0c06/maintainability)](https://codeclimate.com/github/acuminous/tripitaka/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/7321a236e3d434fe0c06/test_coverage)](https://codeclimate.com/github/acuminous/tripitaka/test_coverage)
[![Code Style](https://img.shields.io/badge/code%20style-prettier-brightgreen.svg)](https://github.com/prettier/prettier)
[![Discover zUnit](https://img.shields.io/badge/Discover-zUnit-brightgreen)](https://www.npmjs.com/package/zunit)

Tripitaka is a low dependency, no frills logger, designed to play nicely with tools like fluentd and Elasticsearch. It is named after the buddhist monk from the TV series, [Monkey](<https://en.wikipedia.org/wiki/Monkey_(TV_series)>) due to shared values of simplicity and mindfulness, and also because Tripitaka is a term given to ancient collections of Buddhist scriptures, which loosely connects with logging. I wrote Tripitaka because, sadly my previous logger of choice, [winston](https://github.com/winstonjs/winston) has fallen into disrepair.

## TL;DR

```js
const { Logger } = require("tripitaka");
const logger = new Logger();
const book = {
  title: "Monkey",
  author: "Wu Ch'eng-en",
  ISBN10: "9780140441116",
};
logger.info("Retrieved book", { book });
```

```
NODE_ENV=production node index.js
{"level":"INFO","message":"Retrieved book","book":{"title":"Monkey","author":"Wu Ch'eng-en","ISBN10":"9780140441116"},"timestamp":"2022-05-27T18:21:17.371Z"}
```

## Design Principles

Tripitaka intentionally ships with only two transports. A streams-based transport which will write to `stdout` and `stderr` (or other streams which you supply), and an event emitter based transport which will emit events using the global process object (or another emitter which you supply). This library holds the opinion that external files, database and message brokers are all far better handled with a data collector such as [fluentd](https://www.fluentd.org/architecture), but you can write your own transports if you so wish. Tripitaka also eschews child loggers. These are useful for stashing context, but more elegantly implemented via [AsyncLocalStorage](https://nodejs.org/docs/latest-v14.x/api/async_hooks.html#async_hooks_class_asynclocalstorage) or [continuation-local-storage](https://www.npmjs.com/package/continuation-local-storage). See the [express example](https://github.com/acuminous/tripitaka/blob/main/examples/express/index.js) for how.

## Usage

Tripitaka supports the same logging levels as console, i.e.

- logger.trace(message, context)
- logger.debug(message, context)
- logger.info(message, context)
- logger.warn(message, context)
- logger.error(message, context)

The function arguments are always the same, a message and a context, e.g.

```js
logger.info("How blissful it is, for one who has nothing", {
  env: process.env.NODE_ENV,
});
```

Assuming the default configuration, this will write the following to stdout when run in a production environment

```json
{
  "env": "production",
  "message": "How blissful it is, for one who has nothing",
  "level": "INFO"
}
```

If you use the context processor (enabled by default), the context may be an Object, Array or Error. Both errors and array are automatically nested under configurable attributes, which default to "error" and "items" respectively, e.g.

```js
logger.info("How blissful it is, for one who has nothing", [1, 2, 3]);
logger.error("I forbid it!", new Error("Oooh, Demons!"));
```

```json
{"items":[1,2,3],"message":"How blissful it is, for one who has nothing","level":"INFO"}
{"error":{"message":"Oooh, Demons!","stack":"..."},"message":"Oooh, Demons!","level":"ERROR"}
```

If you use the empty processor (enabled by default), and you neglect to log a message, Tripitaka will report this

```js
logger.info({ env: process.env.NODE_ENV });
```

```json
{
  "message": "Empty message logged at Test._fn (/opt/acuminous/tripitaka/index.js:9:5)",
  "env": "production"
}
```

The exception to this is when you are just logging an Error, in which case the log record message will default to the error message e.g.

```js
logger.error(new Error("Oooh, Demons!"));
```

```json
{
  "error": { "message": "Oooh, Demons!", "stack": "..." },
  "message": "Oooh, Demons!",
  "level": "ERROR"
}
```

## Customisation

You can customise this output through the use of [processors](#processors) and [transports](#transports). By default Tripitaka ships with the following configuration.

```js
const { Logger, Level, processors, transports } = require("tripitaka");
const { context, timestamp, json, human } = processors;
const { stream } = transports;

const logger = new Logger({
  level: Level.INFO,
  processors: [
    context(),
    timestamp(),
    process.env.NODE_ENV === "production" ? json() : human(),
  ],
  transports: [stream()],
});
```

## Suppressing logs

You can suppress logs by setting the logging level as when you create a `Logger` instance as above, or by calling `logger.disable()`. You can re-enable the logger by calling `logger.enable()`.

## Processors

A processor is a function you can use to mutate the Tripitaka log record before it is delivered to the transports. Since processors are chained together in an array, the record can be mutated over a series of steps.

The processor is called with a single object containing the following properties:

| name    | type   | notes                                                                                     |
| ------- | ------ | ----------------------------------------------------------------------------------------- |
| level   | Level  |                                                                                           |
| message | string |                                                                                           |
| ctx     | object |                                                                                           |
| record  | any    | Initialised to a shallow clone of the context. Be careful not to mutate nested attributes |

#### example

```js
const logger = new Logger({
  processors: [
    context(),
    ({ record }) => {
      return { ...record, timestamp: new Date() };
    },
    json(),
  ],
});
```

The out-of-the-box processors are as follows...

- [augment](#augment)
- [buffer](#buffer)
- [context](#context)
- [empty](#empty)
- [human](#human)
- [index](#index)
- [json](#json)
- [timestamp](#timestamp)
- [datadog](#datadog)

### augment

Augments the record with the supplied source. If attributes are common to both the record and the source, the source wins. Use with [AsyncLocalStorage](https://nodejs.org/docs/latest-v14.x/api/async_hooks.html#async_hooks_class_asynclocalstorage) as a substitute for child loggers. See the [express example](https://github.com/acuminous/tripitaka/blob/main/examples/express/index.js) for how.

| name   | type               | required | default | notes |
| ------ | ------------------ | -------- | ------- | ----- |
| source | object or function | yes      |         |       |

#### Object example

Use an object when the source data is static

```js
const source = { env: process.env.NODE_ENV };
const logger = new Logger({
  processors: [context(), augment({ source }), json()],
});
logger.info("How blissful it is, for one who has nothing");
```

```json
{
  "env": "production",
  "message": "How blissful it is, for one who has nothing",
  "level": "INFO"
}
```

#### Function example

Use a function when the source data is dynamic

```js
const source = () => ({ timestamp: new Date() });
const logger = new Logger({
  processors: [context(), augment({ source }), json()],
});
logger.info("How blissful it is, for one who has nothing");
```

```json
{
  "timestamp": "2021-03-28T17:43:12.012Z",
  "message": "How blissful it is, for one who has nothing",
  "level": "INFO"
}
```

### buffer

The buffer processor outputs the record as a buffer, optionally encoding it before doing so. For this processor to work, the record must previously have been converted to a string.

| name           | type   | required | default | notes |
| -------------- | ------ | -------- | ------- | ----- |
| inputEncoding  | string | no       |         |       |
| outputEncoding | string | no       |         |       |

#### example

```js
const logger = new Logger({
  processors: [context(), json(), buffer({ outputEncoding: "hex" })],
});
logger.info("How blissful it is, for one who has nothing");
```

```
7b226c6576656c223a22494e464f222c226d657373616765223a22486f7720626c69737366756c2069742069732c20666f72206f6e652077686f20686173206e6f7468696e67227d
```

### context

Performs a shallow copy of the context into the record. It also understands how to handle errors - without it they will not serialize correctly. It is best to put this processor first in the list of processors, as if another processor fires first, it may incorrectly handle the error object.

The processor operates with the following logic:

- If the context is an Error, it will be converted to a plain object and assigned to the property specified by the `errorField` option.
- If the context is an Array, it will be converted to a plain object and assigned to the property specified by the `arrayField` option.
- Otherwise if any top level context properties are Errors, they will be converted to plain objects

It has the following options:

| name       | type    | required | default | notes                                                                                       |
| ---------- | ------- | -------- | ------- | ------------------------------------------------------------------------------------------- |
| arrayField | string  | no       | 'items' | If the context is an instance of Array, it will be nested under an attribute with this name |
| errorField | string  | no       | 'error' | If the context is an instance of Error, it will be nested under an attribute with this name |
| stack      | boolean | no       | true    | Controls whether the stack trace will be logged                                             |

#### example

```js
const logger = new Logger({
  processors: [context({ errorField: "err", stack: false }), json()],
});
logger.error("I forbid it!", new Error("Oooh, Demons!"));
```

```json
{
  "error": { "message": "Oooh, Demons!" },
  "message": "I forbid it!",
  "level": "ERROR"
}
```

### empty

Logs a message when attempts are made to log an undefined, null or empty message

#### example

```js
const logger = new Logger({
  processors: [context({ errorField: "err", stack: false }), empty(), json()],
});
logger.error(undefined);
```

```json
{
  "message": "Empty message logged at Test._fn (/opt/acuminous/tripitaka/index.js:9:5)",
  "level": "ERROR"
}
```

### human

Converts the record into a human readable form. Only intended for local use.

It has the following options:

| name       | type     | required | default   | notes                                                                                                                              |
| ---------- | -------- | -------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| serializer | function | no       | null      |                                                                                                                                    |
| indent     | number   | no       | undefined |                                                                                                                                    |
| decycler   | function | no       | () => {}  | Determines how circular references are handled. The default behaviour is to silently drop the attribute                            |
| colours    | integer  | no       | undefined | Defaults to auto detecting colour support. Specify 0 to disable, 1 for basic colours, 2 for 256 colour support or 3 for Truecolour |

#### example

```js
const logger = new Logger({
  processors: [context(), human()],
});
logger.info("How blissful it is, for one who has nothing", {
  pid: process.pid,
  ...process.memoryUsage(),
});
```

```
2021-03-28 18:15:23 INFO  How blissful it is, for one who has nothing
{
  "pid": 53072,
  "rss": 31997952,
  "heapTotal": 6938624,
  "heapUsed": 5361608,
  "external": 356316,
  "arrayBuffers": 25566
}
```

### index

Creates a sub document of simple values from the specified paths. This is useful to avoid [mapping explosion](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html#mapping-limit-settings) when writing logs to Elasticsearch. The idea is to disable dynamic mapping by default in your Elasticsearch configuration, and specifically enable it only for the named sub document. Since the processor only copies fields with simple values into the index, you should remain in control of the Elasticsearch index, but still be able to search by key terms and inspect the full log context.

It has the following options:

| name               | type    | required | default  | notes                                                                                 |
| ------------------ | ------- | -------- | -------- | ------------------------------------------------------------------------------------- |
| field              | string  | no       | 'fields' | Specifies the name of the sub document                                                |
| paths              | array   | no       | []       | Specifies the paths of the fields to map                                              |
| reportComplexTypes | boolean | no       | false    | Causes the processor to throw an error if value type is an object, function or symbol |

NaN and Infinite values are always silently dropped as they could cause the field to by dynamically mapped as a string instead of a number.

#### example

```js
const reportComplexTypes = process.env.NODE_ENV !== "production";
const logger = new Logger({
  processors: [
    context(),
    index({ field: "@fields", paths: ["character.name"], reportComplexTypes }),
    json(),
  ],
});
logger.info("How blissful it is, for one who has nothing", {
  character: { name: "Monkey", nature: "Irrepressible" },
});
```

```json
{
  "message": "How blissful it is, for one who has nothing",
  "level": "INFO",
  "character": { "name": "Monkey", "nature": "Irrepresible" },
  "@fields": { "name": "Monkey" }
}
```

### json

Uses [json-stringify-safe](https://www.npmjs.com/package/json-stringify-safe) to safely convert the Tripitaka record to a json string.

It has the following options:

| name       | type     | required | default   | notes                                                                                                   |
| ---------- | -------- | -------- | --------- | ------------------------------------------------------------------------------------------------------- |
| serializer | function | no       | null      |                                                                                                         |
| indent     | number   | no       | undefined |                                                                                                         |
| decycler   | function | no       | () => {}  | Determines how circular references are handled. The default behaviour is to silently drop the attribute |

#### example

```js
const logger = new Logger({
  processors: [context(), json()],
});
logger.info("How blissful it is, for one who has nothing", {
  env: process.env.NODE_ENV,
});
```

```json
{
  "env": "production",
  "message": "How blissful it is, for one who has nothing",
  "level": "INFO"
}
```

### timestamp

Adds a timestamp. It has the following options:

| name         | type     | required | default           | notes                                                                                 |
| ------------ | -------- | -------- | ----------------- | ------------------------------------------------------------------------------------- |
| field        | string   | no       | 'timestamp'       | Specifies the name of the timestamp attribute                                         |
| getTimestamp | function | no       | () => new Date(); | Overrides how the timestamp is aquired (useful for fixing the timestamp when testing) |

#### example

```js
const logger = new Logger({
  processors: [context(), timestamp({ field: "ts" }), json()],
});
logger.info("How blissful it is, for one who has nothing", {
  env: process.env.NODE_ENV,
});
```

```json
{
  "ts": "2021-03-28T18:31:21.035Z",
  "env": "production",
  "message": "How blissful it is, for one who has nothing",
  "level": "INFO"
}
```

### datadog

Injects Datadog object to link logs with APM events:

#### example

```js
const logger = new Logger({
  processors: [context(), datadog(), json()],
});
logger.info("How blissful it is, for one who has nothing", {
  env: process.env.NODE_ENV,
});
```

```json
{
  "env": "production",
  "message": "How blissful it is, for one who has nothing",
  "level": "INFO",
  "dd": {
    "trace_id": "8171558781539659567",
    "span_id": "6706824917493320824",
    "service": "test-service",
    "version": "0.1",
    "env": "production"
  }
}
```

## Transports

Transports are functions which write the Tripitaka record somewhere. The only parameter is an object, which should container the following properties.

| name   | type  | notes                                                                                          |
| ------ | ----- | ---------------------------------------------------------------------------------------------- |
| level  | Level |                                                                                                |
| record | any   | Likely to be an object, string or a Buffer. It all depends on the processors you have selected |

The available transports are

- [stream](#stream)
- [emitter](#emitter)
- [datadog](https://www.npmjs.com/package/tripitaka-sumologic)
- [sumologic](https://www.npmjs.com/package/tripitaka-sumologic)
- [vax terminal](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

### stream

The stream transport writes a string to an output stream based on the level. It has the following options:

| name    | type   | required | default     | notes                                                                                                              |
| ------- | ------ | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| level   | Level  | no       | Level.TRACE | The minimum log level for this transport                                                                           |
| streams | object | no       | See notes   | By default TRACE, DEBUG and INFO messages will be output to stdout, while WARN and ERROR messages routed to stderr |

#### example

```js
const logger = new Logger({
  transports: [
    stream({
      streams: {
        [Level.TRACE.name]: process.stdout,
        [Level.DEBUG.name]: process.stdout,
        [Level.INFO.name]: process.stdout,
        [Level.WARN.name]: process.stdout,
        [Level.ERROR.name]: process.stderr,
      },
    }),
  ],
});
logger.info("How blissful it is, for one who has nothing", {
  env: process.env.NODE_ENV,
});
```

### emitter

The emitter transport emits a Tripitaka record as an event, which can be useful when testing. It has the following options:

| name    | type         | required | default     | notes                                                                                                                                                                 |
| ------- | ------------ | -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| level   | Level        | no       | Level.TRACE | The minimum log level for this transport                                                                                                                              |
| emitter | EventEmitter | no       | process     | Specify your own event emitter rather than the global process object                                                                                                  |
| events  | object       | no       | See notes   | By default all log levels will be emitted with the 'log' event. Think twice about changing this to 'error', since unhandled error events will kill your node process. |

#### example

```js
const logger = new Logger({
  transports: [
    emitter({
      events: {
        [Level.TRACE.name]: "log_trace",
        [Level.DEBUG.name]: "log_debug",
        [Level.INFO.name]: "log_info",
        [Level.WARN.name]: "log_warn",
        [Level.ERROR.name]: "log_error",
      },
    }),
  ],
});
logger.info("How blissful it is, for one who has nothing", {
  env: process.env.NODE_ENV,
});
```
