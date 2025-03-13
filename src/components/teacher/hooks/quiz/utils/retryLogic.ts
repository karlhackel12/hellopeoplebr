
/**
 * Executes a function with retry logic
 * @param fn The async function to execute
 * @param maxAttempts Maximum number of attempts
 * @param delayMs Delay between retries in milliseconds
 * @returns The result, error, and number of attempts made
 */
export const executeWithRetry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<{ result: T | null; error: Error | null; attempts: number }> => {
  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      const result = await fn();
      return { result, error: null, attempts };
    } catch (error: any) {
      console.warn(`Attempt ${attempts} failed:`, error);
      lastError = error;
      
      // Don't wait on the last attempt
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  return { result: null, error: lastError, attempts };
};
