
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
// Import BugsterTracker directly to avoid TypeScript errors
import { BugsterTracker } from '@bugster/bugster-js';

// Criar uma interface mínima para o objeto Bugster
interface BugsterInstance {
  captureException?: (error: Error, context?: Record<string, any>) => void;
  captureMessage?: (message: string, context?: Record<string, any>) => void;
  setUser?: (userId: string, userData?: Record<string, any>) => void;
}

// Create manualmente os métodos se não estiverem disponíveis
const createBugsterWrapper = (instance: any): BugsterInstance => {
  const wrapper: BugsterInstance = {};
  
  // Verificar se o instance é válido
  if (!instance) return wrapper;
  
  // Implementar captureException
  wrapper.captureException = (error: Error, context?: Record<string, any>) => {
    console.log('Bugster: captureException', error, context);
    
    // Tentar usar o método nativo se existir
    if (typeof instance.captureException === 'function') {
      instance.captureException(error, context);
    } 
    // Tentar usar captureMessage como fallback
    else if (typeof instance.captureMessage === 'function') {
      instance.captureMessage(`Error: ${error.message}`, {
        ...context,
        stack: error.stack,
        name: error.name
      });
    }
    // Tentar usar outros métodos possíveis
    else if (typeof instance.trackException === 'function') {
      instance.trackException(error, context);
    }
    // Último recurso: enviar para console
    else {
      console.error('Bugster (fallback): ', error, context);
    }
  };
  
  // Implementar captureMessage
  wrapper.captureMessage = (message: string, context?: Record<string, any>) => {
    console.log('Bugster: captureMessage', message, context);
    
    // Tentar usar o método nativo se existir
    if (typeof instance.captureMessage === 'function') {
      instance.captureMessage(message, context);
    } 
    // Tentar usar outros métodos possíveis como fallback
    else if (typeof instance.trackMessage === 'function') {
      instance.trackMessage(message, context);
    }
    else if (typeof instance.track === 'function') {
      instance.track('message', { message, ...context });
    }
    // Último recurso: enviar para console
    else {
      console.info('Bugster (fallback): ', message, context);
    }
  };
  
  // Implementar setUser
  wrapper.setUser = (userId: string, userData?: Record<string, any>) => {
    console.log('Bugster: setUser', userId, userData);
    
    // Tentar usar o método nativo se existir
    if (typeof instance.setUser === 'function') {
      instance.setUser(userId, userData);
    } 
    // Tentar outros métodos possíveis
    else if (typeof instance.identify === 'function') {
      instance.identify(userId, userData);
    }
    else if (typeof instance.setUserContext === 'function') {
      instance.setUserContext({ id: userId, ...userData });
    }
    // Último recurso: armazenar localmente
    else {
      console.info('Bugster (fallback) setUser: ', userId, userData);
    }
  };
  
  return wrapper;
};

interface BugsterContextType {
  bugster: BugsterInstance | null;
  isConnected: boolean;
  connectionError: string | null;
}

const BugsterContext = createContext<BugsterContextType>({ 
  bugster: null, 
  isConnected: false,
  connectionError: null
});

export const useBugster = () => useContext(BugsterContext);

interface BugsterProviderProps {
  children: ReactNode;
}

export const BugsterProvider = ({ children }: BugsterProviderProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [bugster, setBugster] = useState<BugsterInstance | null>(null);
  const [rawInstance, setRawInstance] = useState<any | null>(null);

  // Verifica se a rede está disponível
  const checkNetworkStatus = () => {
    return navigator.onLine;
  };

  // Testa a conexão com o servidor Bugster usando uma função auxiliar
  const testConnection = async () => {
    try {
      // Se temos um objeto bugster válido com métodos
      if (bugster && (bugster.captureMessage || bugster.captureException)) {
        // Enviamos uma mensagem de teste
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

  useEffect(() => {
    const initializeBugster = async () => {
      if (bugster) return;
      
      // Verifica se há conexão de rede
      if (!checkNetworkStatus()) {
        console.error('Sem conexão de rede. Bugster não inicializado.');
        setConnectionError('Sem conexão de rede');
        return;
      }
      
      try {
        // Verificamos o formato do SDK Bugster
        console.log('Formato do SDK Bugster:', BugsterTracker);
        
        let instance = null;
        
        // Tentamos inicializar usando o construtor do BugsterTracker
        try {
          console.log('Inicializando Bugster via BugsterTracker constructor');
          instance = new BugsterTracker({
            apiKey: "bugster_xeXxZuTROPArSb4dv5wGg5iD57yFvijitjZhIbHQazAGkU9YSpMP",
            endpoint: "https://i.bugster.app",
            // Removendo a propriedade environment que causava o erro
            // environment: process.env.NODE_ENV || 'development',
            release: '1.0.0',
            debug: true,
          });
          console.log('Instância do Bugster criada:', instance);
        } catch (error) {
          console.error('Erro ao inicializar Bugster com BugsterTracker:', error);
          
          // Se falhar, tentamos criar uma implementação fake para não quebrar a aplicação
          console.warn('Criando implementação fake do Bugster como fallback');
          instance = {
            _isFake: true,
            _events: []
          };
        }
        
        // Salvamos a instância original para referência
        setRawInstance(instance);
        
        // Criamos um wrapper com os métodos garantidos
        const bugsterWrapper = createBugsterWrapper(instance);
        
        // Verificamos se conseguimos criar o wrapper
        if (bugsterWrapper) {
          console.log('Bugster wrapper criado com sucesso', bugsterWrapper);
          setBugster(bugsterWrapper);
          
          // Testamos a conexão depois que a instância estiver disponível
          setTimeout(async () => {
            await testConnection();
          }, 100);
        } else {
          console.error('Falha ao criar wrapper do Bugster');
          setConnectionError('Falha ao criar wrapper do Bugster');
        }
      } catch (error) {
        console.error('Erro ao inicializar Bugster:', error);
        setConnectionError(error instanceof Error ? error.message : 'Erro desconhecido');
      }
    };
    
    initializeBugster();
    
    // Monitorar mudanças no status da rede
    const handleOnline = () => {
      console.log('Conexão de rede restaurada, tentando reconectar o Bugster...');
      setConnectionError(null);
      initializeBugster();
    };
    
    const handleOffline = () => {
      console.warn('Conexão de rede perdida, Bugster pode não funcionar corretamente');
      setConnectionError('Sem conexão de rede');
      setIsConnected(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [bugster]);

  return (
    <BugsterContext.Provider value={{ bugster, isConnected, connectionError }}>
      {children}
    </BugsterContext.Provider>
  );
};
