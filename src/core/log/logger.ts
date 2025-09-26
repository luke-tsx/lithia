import { bold, green, magenta, red, white, yellow } from './picocolors';

export interface Logger {
  info(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
  success(message: string, ...args: unknown[]): void;
  ready(message: string, ...args: unknown[]): void;
  wait(message: string, ...args: unknown[]): void;
  event(message: string, ...args: unknown[]): void;
  trace(message: string, ...args: unknown[]): void;
  bootstrap(...message: string[]): void;
  warnOnce(message: string): void;
}

export class ConsolaLogger implements Logger {
  private colors: boolean;
  private level: string;

  private prefixes = {
    wait: white(bold('○')),
    error: red(bold('⨯')),
    warn: yellow(bold('⚠')),
    ready: '▲',
    info: white(bold(' ')),
    event: green(bold('✓')),
    trace: magenta(bold('»')),
  };

  constructor(options?: {
    colors?: boolean;
    timestamp?: boolean;
    level?: string;
  }) {
    this.colors = options?.colors !== false;
    this.level = options?.level || 'info';
  }

  private formatMessage(prefix: string, message: string): string {
    const coloredPrefix = this.colors
      ? prefix
      : prefix.replace(/\[[0-9;]*m/g, '');
    return ` ${coloredPrefix} ${message}`;
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  info(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return;
    const formatted = this.formatMessage(this.prefixes.info, message);
    console.log(formatted, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('error')) return;
    const formatted = this.formatMessage(this.prefixes.error, message);
    console.error(formatted, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('warn')) return;
    const formatted = this.formatMessage(this.prefixes.warn, message);
    console.warn(formatted, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('debug')) return;
    const formatted = this.formatMessage(this.prefixes.info, message);
    console.debug(formatted, ...args);
  }

  success(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return;
    const formatted = this.formatMessage(this.prefixes.event, message);
    console.log(formatted, ...args);
  }

  ready(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return;
    const formatted = this.formatMessage(this.prefixes.ready, message);
    console.log(formatted, ...args);
  }

  wait(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return;
    const formatted = this.formatMessage(this.prefixes.wait, message);
    console.log(formatted, ...args);
  }

  event(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return;
    const formatted = this.formatMessage(this.prefixes.event, message);
    console.log(formatted, ...args);
  }

  trace(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('debug')) return;
    const formatted = this.formatMessage(this.prefixes.trace, message);
    console.debug(formatted, ...args);
  }

  bootstrap(...message: string[]): void {
    if (!this.shouldLog('info')) return;
    console.log('   ' + message.join(' '));
  }

  warnOnce(message: string): void {
    const key = Symbol.for(message);
    if (!(key in globalThis)) {
      (globalThis as Record<symbol, boolean>)[key] = true;
      this.warn(message);
    }
  }
}
