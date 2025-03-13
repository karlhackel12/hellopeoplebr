
/**
 * Executes a function with retry logic
 * @param fn The async function to execute
 * @param maxAttempts Maximum number of attempts
 * @param delayMs Delay between retries in milliseconds
 * @param backoffFactor Factor to increase delay on subsequent retries
 * @returns The result, error, and number of attempts made
 */
export const executeWithRetry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000,
  backoffFactor: number = 1.5
): Promise<{ result: T | null; error: Error | null; attempts: number }> => {
  let attempts = 0;
  let lastError: Error | null = null;
  let currentDelay = delayMs;

  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      const result = await fn();
      return { result, error: null, attempts };
    } catch (error: any) {
      console.warn(`Attempt ${attempts} failed:`, error);
      lastError = error;
      
      // Categorize errors to determine if retry is appropriate
      const isNetworkError = error.message?.includes('Failed to fetch') || 
                             error.message?.includes('Network') ||
                             error.message?.includes('timeout');
                             
      const isServerError = error.status >= 500 || error.message?.includes('500');
      
      // For certain errors, we might want to fail fast
      if (!isNetworkError && !isServerError && error.status !== 429) {
        console.error('Non-retriable error detected, failing fast:', error);
        break;
      }
      
      // Don't wait on the last attempt
      if (attempts < maxAttempts) {
        console.log(`Retrying in ${currentDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay = Math.min(currentDelay * backoffFactor, 10000); // Cap at 10 seconds
      }
    }
  }

  return { result: null, error: lastError, attempts };
};

/**
 * A specialized version of executeWithRetry for handling database operations
 */
export const executeDbOperationWithRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T | null> => {
  const { result, error, attempts } = await executeWithRetry(
    operation,
    2, // Most DB operations should succeed quickly or fail fast
    500
  );
  
  if (error) {
    console.error(`Failed ${operationName} after ${attempts} attempts:`, error);
    return null;
  }
  
  return result;
};
