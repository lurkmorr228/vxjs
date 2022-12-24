export interface ILogger {
  log: (...messages: string[]) => void;
  error: (...messages: string[]) => void;
  warn: (...messages: string[]) => void;
  debug: (...messages: string[]) => void;
  info: (...messages: string[]) => void;
}
