class Logger {
  debug(message: string, data?: unknown): void {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  info(message: string, data?: unknown): void {
    console.log(`[INFO] ${message}`, data || '');
  }

  warn(message: string, data?: unknown): void {
    console.warn(`[WARN] ${message}`, data || '');
  }

  error(message: string, data?: unknown): void {
    console.error(`[ERROR] ${message}`, data || '');
  }
}

export const logger = new Logger();
