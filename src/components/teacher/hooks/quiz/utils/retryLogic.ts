
/**
 * Executes a function with retry logic
 * @param fn The function to execute with retry logic
 * @param maxAttempts Maximum number of retry attempts
 * @param delayMs Delay between retries in milliseconds
 */
export const executeWithRetry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 2,
  delayMs: number = 1000
): Promise<{ result: T | null; error: any; attempts: number }> => {
  let attempts = 0;
  let error = null;
  let result = null;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      
      // Execute the function
      result = await fn();
      
      // If successful, break the retry loop
      error = null;
      break;
    } catch (err) {
      console.error(`Error in attempt ${attempts}:`, err);
      error = err;
      
      // If this is not the last attempt, wait before retrying
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  return { result, error, attempts };
};
