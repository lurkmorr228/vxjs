import type { ILogger } from './logger.interface';

export interface ILoggerFactory {
  createLogger: (context: string) => ILogger;
}
