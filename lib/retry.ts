/**
 * Exponential backoff retry with configurable delays
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delays: number[] = [1000, 5000, 30000]
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = delays[Math.min(attempt, delays.length - 1)];
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Check if error is transient (retryable)
 */
export function isTransientError(errorCode?: string): boolean {
  const transientErrors = [
    'processing_error',
    'rate_limit_error',
    'api_connection_error',
    'timeout',
    'service_unavailable',
  ];
  return transientErrors.includes(errorCode || '');
}
