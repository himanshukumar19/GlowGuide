export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Simple structured logger for the RAG pipeline.
 * Prefixes logs with timestamp and level.
 */
export const logger = {
  debug(message: string, data?: Record<string, any>) {
    // TODO: Implement debug logging (only in development)
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${new Date().toISOString()} ${message}`, data ?? "");
    }
  },

  info(message: string, data?: Record<string, any>) {
    // TODO: Implement info logging
    console.info(`[INFO] ${new Date().toISOString()} ${message}`, data ?? "");
  },

  warn(message: string, data?: Record<string, any>) {
    // TODO: Implement warning logging
    console.warn(`[WARN] ${new Date().toISOString()} ${message}`, data ?? "");
  },

  error(message: string, error?: Error | Record<string, any>) {
    // TODO: Implement error logging with stack trace support
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`, error ?? "");
  },
};
