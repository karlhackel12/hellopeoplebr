
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
    console.log('Testando conexão Bugster com:', bugster);
    
    // If the wrapper is null or undefined
    if (!bugster) {
      console.warn('Objeto Bugster não existe');
      setIsConnected(false);
      setConnectionError('Objeto Bugster não inicializado');
      return false;
    }
    
    // Log available methods on the bugster object
    console.log('Métodos disponíveis no wrapper:', 
      Object.keys(bugster).filter(key => typeof bugster[key as keyof BugsterInstance] === 'function'));
    
    // Check methods from the wrapper (not the original instance)
    if (typeof bugster.captureMessage === 'function' || typeof bugster.captureException === 'function') {
      try {
        // Send a test message
        if (typeof bugster.captureMessage === 'function') {
          console.log('Enviando mensagem de teste via captureMessage');
          bugster.captureMessage('Teste de conexão Bugster');
        } else if (typeof bugster.captureException === 'function') {
          console.log('Enviando mensagem de teste via captureException');
          bugster.captureException(new Error('Teste de conexão Bugster'));
        }
        
        console.log('Conexão com Bugster testada com sucesso');
        setIsConnected(true);
        setConnectionError(null);
        return true;
      } catch (error) {
        console.error('Erro ao enviar mensagem de teste:', error);
        setIsConnected(false);
        setConnectionError('Erro ao enviar mensagem de teste: ' + (error instanceof Error ? error.message : String(error)));
        return false;
      }
    } else {
      console.warn('Wrapper do Bugster não tem métodos de rastreamento necessários');
      setIsConnected(false);
      setConnectionError('Bugster wrapper não tem métodos de rastreamento');
      return false;
    }
  } catch (error) {
    console.error('Falha ao conectar com o servidor Bugster:', error);
    setIsConnected(false);
    setConnectionError(error instanceof Error ? error.message : 'Erro desconhecido');
    return false;
  }
};
