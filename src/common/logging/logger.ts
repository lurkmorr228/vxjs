import type { ILogger } from './logger.interface';

interface Color {
  log: string;
  error: string;
  warn: string;
  debug: string;
  info: string;
  reset: string;
}

export class Logger implements ILogger {
  private static colors = ((): Color => {
    const isServer = global.IsDuplicityVersion();

    return isServer
      ? {
          log: '\x1b[97m',
          error: '\x1b[31m',
          warn: '\x1b[93m',
          debug: '\x1b[94m',
          info: '\x1b[34m',
          reset: '\x1b[0m',
        }
      : {
          log: '^7',
          error: '^1',
          warn: '^3',
          debug: '^5',
          info: '^4',
          reset: '^7',
        };
  })();

  private static get timestamp(): string {
    return new Date()
      .toISOString()
      .replace(/T/, ' ') // replace T with a space
      .replace(/\..+/, '');
  }

  private static colorize(key: keyof Omit<Color, 'reset'>, message: string): string {
    return `${this.colors[key]}[${key}] ${message} ${this.colors.reset}`;
  }

  public constructor(private readonly context: string) {}
  public log(...messages: string[]): void {
    console.log(Logger.colorize('log', `[${this.context} - ${Logger.timestamp}] - ${messages.join('\t')}`));
  }

  public error(...messages: string[]): void {
    console.log(Logger.colorize('error', `[${this.context} - ${Logger.timestamp}] - ${messages.join('\t')}`));
  }

  public warn(...messages: string[]): void {
    console.log(Logger.colorize('warn', `[${this.context} - ${Logger.timestamp}] - ${messages.join('\t')}`));
  }

  public debug(...messages: string[]): void {
    console.log(Logger.colorize('debug', `[${this.context} - ${Logger.timestamp}] - ${messages.join('\t')}`));
  }

  public info(...messages: string[]): void {
    console.log(Logger.colorize('info', `[${this.context} - ${Logger.timestamp}] - ${messages.join('\t')}`));
  }
}
