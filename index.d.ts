type Processor = (params: {
  level: Level,
  message: any,
  ctx: any,
  record: any,
}) => any;

type ProcessorFactory = (...any) => Processor;

type Transport = (params: {
  level: Level,
  record: any,
}) => any;

type TransportFactory = (...any) => Transport;

export class Level {
  name: string;
  method: string;
  value: number;
  static TRACE: Level;
  static DEBUG: Level;
  static INFO: Level;
  static WARN: Level;
  static ERROR: Level;
}

export class Logger {
  constructor(options?: {
    level?: Level,
    processors?: ProcessorFactory[],
    transports?: TransportFactory[],
  });
  trace(message: any, context?: any): void;
  debug(message: any, context?: any): void;
  info(message: any, context?: any): void;
  warn(message: any, context?: any): void;
  error(message: any, context?: any): void;
}

export const processors: {
  augment: ProcessorFactory;
  buffer: ProcessorFactory;
  context: ProcessorFactory;
  error: ProcessorFactory;
  human: ProcessorFactory;
  index: ProcessorFactory;
  json: ProcessorFactory;
  timestamp: ProcessorFactory;
};

export const transports: {
  emitter: TransportFactory;
  stream: TransportFactory;
};
