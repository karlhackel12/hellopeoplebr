import { useBugster } from "@/providers/BugsterProvider";
import { useCallback } from "react";

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
  const { bugster, isConnected, connectionError } = useBugster();

  const logError = useCallback((error: Error | unknown, context?: Record<string, any>) => {
    if (!bugster) {
      console.error("Bugster não inicializado!", error);
      return;
    }

    // O método captureException já está garantido pelo wrapper
    if (error instanceof Error) {
      bugster.captureException?.(error, context);
    } else {
      bugster.captureMessage?.(String(error), context);
    }
  }, [bugster]);

  const logMessage = useCallback((message: string, context?: Record<string, any>) => {
    if (!bugster) {
      console.warn("Bugster não inicializado!", message);
      return;
    }

    // O método captureMessage já está garantido pelo wrapper
    bugster.captureMessage?.(message, context);
  }, [bugster]);

  const setUser = useCallback((userId: string, userData?: Record<string, any>) => {
    if (!bugster) {
      console.warn("Bugster não inicializado! Não foi possível definir o usuário.");
      return;
    }

    // O método setUser já está garantido pelo wrapper
    bugster.setUser?.(userId, userData);
  }, [bugster]);

  return {
    bugster,
    logError,
    logMessage,
    setUser,
    isConnected,
    connectionError
  };
};
