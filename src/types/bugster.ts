
/**
 * Interface for the Bugster SDK instance wrapper
 */
export interface BugsterInstance {
  captureException?: (error: Error, context?: Record<string, any>) => void;
  captureMessage?: (message: string, context?: Record<string, any>) => void;
  setUser?: (userId: string, userData?: Record<string, any>) => void;
}

/**
 * Context type for the Bugster provider
 */
export interface BugsterContextType {
  bugster: BugsterInstance | null;
  isConnected: boolean;
  connectionError: string | null;
}
