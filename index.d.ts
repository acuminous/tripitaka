type Processor = (params: {
  level: Level;
  message: any;
  ctx: any;
  record: any;
}) => any;

type ProcessorFactory = (...args: any[]) => Processor;

type Transport = (params: { level: Level; record: any }) => any;

type TransportFactory = (...args: any[]) => Transport;

export class Level {
  name: string;
  method: string;
  value: number;
  satisfies(other: Level): boolean;
  static TRACE: Level;
  static DEBUG: Level;
  static INFO: Level;
  static WARN: Level;
  static ERROR: Level;
  static lookup(name: string): Level;
}

export class Logger {
  constructor(options?: {
    level?: Level;
    processors?: ProcessorFactory[];
    transports?: TransportFactory[];
  });
  trace(message: String, context?: any): void;
  debug(message: String, context?: any): void;
  info(message: String, context?: any): void;
  warn(message: String, context?: any): void;
  error(message: String, context?: any): void;
  error(context: Error): void;
  enable(): void;
  disable(): void;
}

export const processors: {
  augment: ProcessorFactory;
  buffer: ProcessorFactory;
  context: ProcessorFactory;
  empty: ProcessorFactory;
  error: ProcessorFactory;
  human: ProcessorFactory;
  index: ProcessorFactory;
  json: ProcessorFactory;
  timestamp: ProcessorFactory;
  datadog: ProcessorFactory;
};

export const transports: {
  emitter: TransportFactory;
  stream: TransportFactory;
};
