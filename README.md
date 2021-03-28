# ZenLog

## Motivation
I wrote ZenLog because my previous logger of choice, [winston](https://github.com/winstonjs/winston) has hundreds of [open issues](https://github.com/winstonjs/winston/issues), many of which are serious and have received no response for over a year. [Contributions](https://github.com/winstonjs/winston/graphs/contributors) mostly ceased in 2019.

## TL;DR
```js
const { Logger } = require('zenlog');
const logger = new Logger();
logger.info('ZenLog Rocks!', { env: process.env.NODE_ENV });
```
```
{"env":"production","timestamp":"2021-03-27T23:43:10.023Z","message":"ZenLog Rocks!","level":"INFO"}
```

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
Disregarding any other configuration, this will write the following to stdout
```
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
{"error":{"message":"Oh Noes!","stack":"...","message":"ZenLog Errors!","level":"ERROR"}
{"error":{"message":"Oh Noes!","stack":"...","level":"ERROR"}
{"error":{"message":"Works with other functions too!","stack":"...","level":"INFO"}
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

### Processors

#### error
The error processor is important for logging errors. Without it they will not stringify correctly. The processor operates with the following logic

* If the message is an instance of Error, it will be treated as the context object (see below).
* If the context is an instance of Error, it will be converted it to a plain object and assigned to the property specified by the field option.
* Otherwise if any top level context properties are instances of Error, they will be converted to plain objects

It has the following options:

| name  | type    | required | default | notes |
|-------|---------|----------|---------|-------|
| field | string  | no       | error   | If the context is an instance of Error, it will be nested under an attribute with this name |
| stack | boolean | no       | true    | Controls whether the stack trace will be logged |
