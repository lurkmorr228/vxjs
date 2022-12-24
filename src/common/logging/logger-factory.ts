import { Logger } from './logger';
import type { ILogger } from './logger.interface';
import type { ILoggerFactory } from './logger-factory.interface';

export class LoggerFactory implements ILoggerFactory {
  public createLogger(context: string): ILogger {
    return new Logger(context);
  }
}
