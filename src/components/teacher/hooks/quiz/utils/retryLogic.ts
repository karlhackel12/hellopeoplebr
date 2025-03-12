
/**
 * Execute a function with retry logic
 * @param fn The function to execute
 * @param maxAttempts Maximum number of attempts
 * @param delayMs Delay between attempts in milliseconds
 * @returns The result of the function execution with metadata
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 2,
  delayMs: number = 1000
): Promise<{
  result: T | null;
  error: Error | null;
  attempts: number;
}> {
  let attempts = 0;
  let lastError: Error | null = null;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      const result = await fn();
      return { result, error: null, attempts };
    } catch (error) {
      console.error(`Attempt ${attempts} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If we've reached max attempts, don't delay
      if (attempts >= maxAttempts) break;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return { 
    result: null, 
    error: lastError, 
    attempts 
  };
}
