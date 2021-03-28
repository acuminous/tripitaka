# ZenLog
[![Node.js CI](https://github.com/acuminous/zenlog/workflows/Node.js%20CI/badge.svg)](https://github.com/acuminous/zenlog/actions?query=workflow%3A%22Node.js+CI%22)
[![NPM version](https://img.shields.io/npm/v/zenlog.svg?style=flat-square)](https://www.npmjs.com/package/zenlog)
[![NPM downloads](https://img.shields.io/npm/dm/zenlog.svg?style=flat-square)](https://www.npmjs.com/package/zenlog)
[![Maintainability](https://api.codeclimate.com/v1/badges/33f343b0fd8beafb90aa/maintainability)](https://codeclimate.com/github/acuminous/zenlog/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/33f343b0fd8beafb90aa/test_coverage)](https://codeclimate.com/github/acuminous/zenlog/test_coverage)
[![Code Style](https://img.shields.io/badge/code%20style-esnext-brightgreen.svg)](https://www.npmjs.com/package/eslint-config-esnext)
[![Try zUnit](https://img.shields.io/badge/Try-zUnit-brightgreen)](https://www.npmjs.com/package/zUnit)

ZenLog is a low dependency, no frills logger for Node.js. I wrote it because my previous logger of choice, [winston](https://github.com/winstonjs/winston) has hundreds of [open issues](https://github.com/winstonjs/winston/issues), many of which are serious and have received no response for over a year. [Contributions](https://github.com/winstonjs/winston/graphs/contributors) mostly ceased in 2019. Winston's design also has some serious flaws which can make it hard to format messages and lead to mutation of the log context.

## TL;DR
```js
const { Logger } = require('zenlog');
const logger = new Logger();
logger.info('ZenLog Rocks!', { env: process.env.NODE_ENV });
```
```
{"env":"production","timestamp":"2021-03-27T23:43:10.023Z","message":"ZenLog Rocks!","level":"INFO"}
```

## Design Princials
ZenLog intensionally ships with only two transports. A streams based transport which will write to stdout and stderr (or other streams which you suppy), and an event emitter based transport which will emit events using the global process object (or another emitter which you supply). This library holds the opinion that external files, database and message brokers are all far better handled with a data collector such as [fluentd](https://www.fluentd.org/architecture), but you can of course write your own transports if you so wish. ZenLog also eschews child loggers. These were useful for stashing context, but can be more elegantly implemented via [AsyncLocalStorage](https://nodejs.org/docs/latest-v14.x/api/async_hooks.html#async_hooks_class_asynclocalstorage) or [continuation-local-storage](https://www.npmjs.com/package/continuation-local-storage).

## API
ZenLog supports the same logging levels as console, i.e.

* logger.trace(...)
* logger.debug(...)
* logger.info(...)
* logger.warn(...)
* logger.error(...)

The function arguments are always the same, a mandatory message and an optional context, e.g.
```js
logger.info('ZenLock Rocks!', { env: process.env.NODE_ENV });
```
Assuming the default configuration, this will write the following to stdout
```json
{"env":"production","message":"ZenLog Rocks!","level":"INFO"}
```
If you use the error processor (enabled by default), ZenLog also supports logging errors in place of the context, or even the message, e.g.
```
logger.error('ZenLock Errors!', new Error('Oh Noes!'));
logger.error(new Error('Oh Noes!'));
logger.info(new Error('Works with other functions too!'));
```
Under these circumstances the error will be nested to avoid clashing with any message attribute, e.g.
```
{"error":{"message":"Oh Noes!","stack":"..."},"message":"ZenLog Errors!","level":"ERROR"}
{"error":{"message":"Oh Noes!","stack":"..."},"level":"ERROR"}
{"error":{"message":"Works with other functions too!"},"stack":"...","level":"INFO"}
```

## Customisation
You can customise this output through the use of [processors](#processors) and [transports](#transports). By default ZenLog ships with the following configuration.

```js
const { Logger, Level, processors, transports, } = require('zenlog');
const { error, timestamp, condense, json } = processors;
const { json, human } = transports;

const logger = new Logger({
  processors: [
    error(),
    timestamp(),
    condense(),
    process.env.NODE_ENV === 'production' ? json() : human(),
  ],
  transports: [
    stream(),
  ],
  level: Level.INFO,
})
```
The order of the processors is **extremely** important. The 'error' processor should always be first otherwise another processor may spread the context, transforming it from an instance of Error to a plain object.

## Processors
A processor is a function you can use them to mutate the ZenLog log record before it is delevered to the transports. Since they are chained together in an array, the output from one processor forms the input to the next processor, but most expect a ZenLog record to be supplied. i.e.

```js
const logger = new Logger({
  processors: [
    ({ level, message, ctx }) => {
      return { level, message, ctx: { ...ctx, timestamp: new Date() } };
    },
    json(),
  ],
});
```
If you return false (or falsey) from a processor, the result will be skipped and the original (but potentially mutated) ZenLog record passed to the next processor in the chain.

The out-of-the-box processors are as follows...

- [augment](#augment)
- [condense](#condense)
- [error](#error)
- [human](#human)
- [json](#json)
- [rebase](#rebase)
- [timestamp](#timestamp)

### augment
Augments the log context with an object or function result. Use with [AsyncLocalStorage](https://nodejs.org/docs/latest-v14.x/api/async_hooks.html#async_hooks_class_asynclocalstorage) as a substitute for child loggers.

#### Object based
```js
const logger = new Logger({
  processors: [
    augment({ env: process.env.NODE_ENV }),
    json(),
  ],
});
logger.info('ZenLock Rocks!');
```
```json
{"ctx":{"env":"production"},"message":"ZenLog Rocks!","level":"INFO"}
```

#### Function based
```js
const logger = new Logger({
  processors: [
    augment(() => ({ timestamp: new Date() })),
    json(),
  ],
});
logger.info('ZenLock Rocks!');
```
```json
{"ctx":{"timestamp":"2021-03-28T17:43:12.012Z"},"message":"ZenLog Rocks!","level":"INFO"}
```

### condense
A ZenLog record keeps the level, message and context separate, but this can be cumbersome when you eventually come to write the record out. The condense processer hoists the context.

```js
const logger = new Logger({
  processors: [
    condense(),
    json(),
  ],
});
logger.info('ZenLock Rocks!', { env: process.env.NODE_ENV });
```
```json
{"env":"production","message":"ZenLog Rocks!","level":"INFO"}
```
In the event that the context contains either a message or level attribute, these will be lost in favour of the existing top level ones.

### error
The error processor is important for logging errors. Without it they will not stringify correctly. To work properly this process must come first in the list of processors.

The processor operates with the following logic:

* If the message is an instance of Error, it will be treated as the context object (see below).
* If the context is an instance of Error, it will be converted it to a plain object and assigned to the property specified by the field option.
* Otherwise if any top level context properties are instances of Error, they will be converted to plain objects

It has the following options:

| name  | type    | required | default | notes |
|-------|---------|----------|---------|-------|
| field | string  | no       | error   | If the context is an instance of Error, it will be nested under an attribute with this name |
| stack | boolean | no       | true    | Controls whether the stack trace will be logged |

```js
const logger = new Logger({
  processors: [
    error({ field: 'err', stack: false }),
    json(),    
  ],
});
logger.error("ZenLog Errors!", new Error('Oh Noes'));
```
```json
{"ctx":{"error":{"message":"Oh Noes!"}},"message":"ZenLog Errors!","level":"ERROR"}
```


### human
Uses Node's [format](https://nodejs.org/docs/latest-v14.x/api/util.html#util_util_format_format_args) function to create readable log messages. Only intended for use locally since it does not log the context.

It has the following options:

| name  | type    | required | default | notes |
|-------|---------|----------|---------|-------|
| template | string  | no       | '%o [%s] %s'   | |
| paths | array | no       | ['ctx.timestamp', 'level', 'message'] |    | If you have previously used the condense processor you will need to change this to ['timestamp', 'level', 'message'] |

```js
const logger = new Logger({
  processors: [
    human({ template: '%o [%s] (%d) - %s', paths: ['ctx.timestamp', 'level, 'ctx.pid', message'] }),
  ],
});
logger.info('ZenLog Rocks!', { timestamp: new Date(), pid: process.pid }) 
```
```
2021-03-28T18:15:23.312Z [INFO] (69196) - ZenLog Rocks!
```

### json
Uses [json-strinigfy-safe](https://www.npmjs.com/package/json-stringify-safe) to safely convert the ZenLog record to a json string.

It has the following options:

| name       | type     | required | default   | notes |
|------------|----------|----------|-----------|-------|
| serializer | function | no       | null      |       |
| indent     | number   | no       | undefined |       | 
| decyler    | function | no       | () => {}  | Determines how circular references are handled. The default behaviour is to silently drop the attribute |

```js
const logger = new Logger({
  processors: [
    json(),
  ],
});
logger.info('ZenLock Rocks!', { env: process.env.NODE_ENV });
```
```json
{"ctx":{"env":"production"},"message":"ZenLog Rocks!","level":"INFO"}
```

### rebase
Renames the context attribute. It has the following options:

| name  | type    | required | default   | notes |
|-------|---------|----------|-----------|-------|
| field | string  | yes      |           | Specifies the value to use instead of 'ctx' |

```js
const logger = new Logger({
  processors: [
    rebase({ field: 'info' }),
    json(),
  ],
});
logger.info('ZenLock Rocks!', { env: process.env.NODE_ENV });
```
```json
{"info":{"env":"production"},"message":"ZenLog Rocks!","level":"INFO"}
```

### timestamp
Adds a timestamp. It has the following options:

| name  | type    | required | default   | notes |
|-------|---------|----------|-----------|-------|
| field | string  | no      | 'timestamp'          | Specifies the name of the timestamp attribute |
| getTimestamp | function  | no      | () => new Date(); | Overrides how the timestamp is aquired (useful for fixing the timestamp when testing) |

```js
const logger = new Logger({
  processors: [
    timestamp({ field: 'tx' }),
    json(),
  ],
});
logger.info('ZenLock Rocks!', { env: process.env.NODE_ENV });
```
```json
{"info":{"ts":"2021-03-28T18:31:21.035Z","env":"production"},"message":"ZenLog Rocks!","level":"INFO"}
```

## Transports
Transports are functions which write the ZenLog record somewhere. Depending on the medium they are likely to take a string, or the ZenLog record. The available transports are

- [stream](#stream)
- [emitter](#emitter)

### stream
The stream transport writes a string to an output stream based on the level. It has the following options:

| name    | type    | required | default   | notes |
|---------|---------|----------|-----------|-------|
| streams | object  | no       | See notes | By default TRACE, DEBUG and INFO messages will be output to stdout, while WARN and ERROR messages routed to stderr  |

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
      }
    }),
  ],
});
logger.info('ZenLock Rocks!', { env: process.env.NODE_ENV });
```

### emitter
The emitter transport emits a ZenLog record as an event, which can be useful when testing. It has the following options:

| name    | type         | required | default   | notes |
|---------|--------------|----------|-----------|-------|
| emitter | EventEmitter | no       | process   | Specify your own event emitter rather than the global process object |
| events  | object       | no       | See notes | By default all log levels will be emitted with the 'log' event. Think twice about changing this to 'error', since unhandled error events will kill your node process. |

```js
const logger = new Logger({
  transports: [
    emitter({ 
      events: {
        [Level.TRACE.name]: 'log_trace',
        [Level.DEBUG.name]: 'log_debug',
        [Level.INFO.name]: 'log_info',
        [Level.WARN.name]: 'log_warn',
        [Level.ERROR.name]: 'log_error',
      }
    }),
  ],
});
logger.info('ZenLock Rocks!', { env: process.env.NODE_ENV });
```


