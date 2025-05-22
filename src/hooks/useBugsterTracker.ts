
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
  const { bugster } = useBugster();

  const logError = useCallback((error: Error | unknown, context?: Record<string, any>) => {
    if (!bugster) {
      console.error("Bugster não inicializado!", error);
      return;
    }

    try {
      if (error instanceof Error) {
        // Tentamos usar o método de captura de exceções se disponível
        if (typeof bugster.captureException === 'function') {
          bugster.captureException(error, context);
        } else {
          console.error("Método captureException não disponível", error);
        }
      } else {
        // Tentamos usar o método de captura de mensagens se disponível
        if (typeof bugster.captureMessage === 'function') {
          bugster.captureMessage(String(error), context);
        } else {
          console.error("Método captureMessage não disponível", error);
        }
      }
    } catch (captureError) {
      console.error("Erro ao capturar exceção com Bugster:", captureError, error);
    }
  }, [bugster]);

  const logMessage = useCallback((message: string, context?: Record<string, any>) => {
    if (!bugster) {
      console.warn("Bugster não inicializado!", message);
      return;
    }

    try {
      // Tentamos usar o método de captura de mensagens se disponível
      if (typeof bugster.captureMessage === 'function') {
        bugster.captureMessage(message, context);
      } else {
        console.warn("Método captureMessage não disponível", message);
      }
    } catch (captureError) {
      console.error("Erro ao capturar mensagem com Bugster:", captureError, message);
    }
  }, [bugster]);

  const setUser = useCallback((userId: string, userData?: Record<string, any>) => {
    if (!bugster) {
      console.warn("Bugster não inicializado! Não foi possível definir o usuário.");
      return;
    }

    try {
      // Tentamos usar o método de definição de usuário se disponível
      if (typeof bugster.setUser === 'function') {
        bugster.setUser(userId, userData);
      } else {
        console.warn("Método setUser não disponível", userId);
      }
    } catch (userError) {
      console.error("Erro ao definir usuário no Bugster:", userError, userId);
    }
  }, [bugster]);

  return {
    bugster,
    logError,
    logMessage,
    setUser
  };
};
