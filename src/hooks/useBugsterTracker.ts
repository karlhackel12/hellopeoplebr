import { useBugster } from "@/providers/BugsterProvider";

/**
 * Hook para acessar o Bugster SDK em qualquer componente
 * 
 * @example
 * // Em um componente React
 * const { logError } = useBugsterTracker();
 * 
 * try {
 *   // código que pode gerar erro
 * } catch (error) {
 *   logError(error);
 * }
 */
export const useBugsterTracker = () => {
  const { bugster } = useBugster();

  const logError = (error: Error | unknown, context?: Record<string, any>) => {
    if (!bugster) {
      console.error("Bugster não inicializado!", error);
      return;
    }

    if (error instanceof Error) {
      bugster.captureException(error, context);
    } else {
      bugster.captureMessage(String(error), context);
    }
  };

  const logMessage = (message: string, context?: Record<string, any>) => {
    if (!bugster) {
      console.warn("Bugster não inicializado!", message);
      return;
    }

    bugster.captureMessage(message, context);
  };

  const setUser = (userId: string, userData?: Record<string, any>) => {
    if (!bugster) {
      console.warn("Bugster não inicializado! Não foi possível definir o usuário.");
      return;
    }

    bugster.setUser(userId, userData);
  };

  return {
    bugster,
    logError,
    logMessage,
    setUser
  };
}; 