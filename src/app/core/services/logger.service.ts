import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  debug(message: string, ...optionalParams: unknown[]): void {
    this.write('debug', message, optionalParams);
  }

  info(message: string, ...optionalParams: unknown[]): void {
    this.write('info', message, optionalParams);
  }

  warn(message: string, ...optionalParams: unknown[]): void {
    this.write('warn', message, optionalParams);
  }

  error(message: string, ...optionalParams: unknown[]): void {
    this.write('error', message, optionalParams);
  }

  private write(level: LogLevel, message: string, optionalParams: unknown[]): void {
    if (environment.production && level === 'debug') {
      return;
    }

    const prefix = `[${level.toUpperCase()}]`;
    switch (level) {
      case 'debug':
        console.debug(prefix, message, ...optionalParams);
        break;
      case 'info':
        console.info(prefix, message, ...optionalParams);
        break;
      case 'warn':
        console.warn(prefix, message, ...optionalParams);
        break;
      case 'error':
        console.error(prefix, message, ...optionalParams);
        break;
    }
  }
}
