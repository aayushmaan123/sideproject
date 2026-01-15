/**
 * Logger utility for the AI Website Builder backend
 * Provides structured logging for debugging and QA purposes
 */

export class Logger {
  /**
   * Log an invalid request with session_id, timestamp, and reason
   */
  static logInvalidRequest(
    sessionId: string | undefined,
    reason: string,
    details?: string
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      type: 'INVALID_REQUEST',
      session_id: sessionId || 'MISSING',
      reason,
      details: details || '',
    };

    console.error(JSON.stringify(logEntry));
  }

  /**
   * Log a valid request processing
   */
  static logValidRequest(sessionId: string, originalText: string, sanitizedText: string): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      type: 'VALID_REQUEST',
      session_id: sessionId,
      original_length: originalText.length,
      sanitized_length: sanitizedText.length,
      was_modified: originalText !== sanitizedText,
    };

    console.log(JSON.stringify(logEntry));
  }

  /**
   * Log general information
   */
  static info(message: string, data?: object): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      ...data,
    };

    console.log(JSON.stringify(logEntry));
  }

  /**
   * Log errors
   */
  static error(message: string, error?: Error | unknown): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };

    console.error(JSON.stringify(logEntry));
  }
}
