
import { BugsterInstance } from '../types/bugster';

/**
 * Checks if the network is available
 */
export const checkNetworkStatus = (): boolean => {
  return navigator.onLine;
};

/**
 * Tests the connection with the Bugster server
 */
export const testBugsterConnection = async (
  bugster: BugsterInstance | null,
  setIsConnected: (value: boolean) => void,
  setConnectionError: (value: string | null) => void
): Promise<boolean> => {
  try {
    // If we have a valid bugster object with methods
    if (bugster && (bugster.captureMessage || bugster.captureException)) {
      // Send a test message
      if (bugster.captureMessage) {
        bugster.captureMessage('Teste de conexão Bugster');
      } else if (bugster.captureException) {
        bugster.captureException(new Error('Teste de conexão Bugster'));
      }
      
      console.log('Conexão com Bugster testada com sucesso');
      setIsConnected(true);
      setConnectionError(null);
      return true;
    } else {
      console.warn('Objeto Bugster não tem métodos para testar');
      setIsConnected(false);
      setConnectionError('Bugster não tem métodos de rastreamento');
      return false;
    }
  } catch (error) {
    console.error('Falha ao conectar com o servidor Bugster:', error);
    setIsConnected(false);
    setConnectionError(error instanceof Error ? error.message : 'Erro desconhecido');
    return false;
  }
};
