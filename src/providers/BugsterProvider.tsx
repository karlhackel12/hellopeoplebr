import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { BugsterTracker } from '@bugster/bugster-js';

interface BugsterContextType {
  bugster: BugsterTracker | null;
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
  const [bugster, setBugster] = useState<BugsterTracker | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Verifica se a rede está disponível
  const checkNetworkStatus = () => {
    return navigator.onLine;
  };

  // Testa a conexão com o servidor Bugster
  const testConnection = async (instance: BugsterTracker) => {
    try {
      // Força uma conexão e verifica se há resposta
      await instance.captureMessage('Teste de conexão Bugster', { 
        test: true,
        timestamp: new Date().toISOString()
      });
      setIsConnected(true);
      setConnectionError(null);
      return true;
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
        // Cria uma nova instância do Bugster
        const bugsterInstance = new BugsterTracker({
          apiKey: "bugster_YrA0QUtFB5bjHv63fHhiFTH2SIJvMbszFt0O74my2iqH8btdQ4Gx",
          endpoint: "https://i.bugster.app",
          environment: process.env.NODE_ENV || 'development',
          release: '1.0.0', // Adicione a versão do seu app aqui
          debug: true, // Ative o modo debug para ver os logs no console
        });
        
        // Testa a conexão com o servidor
        const connected = await testConnection(bugsterInstance);
        
        if (connected) {
          console.log('Bugster inicializado com sucesso e conectado ao servidor');
          setBugster(bugsterInstance);
        } else {
          console.error('Bugster inicializado, mas não conectado ao servidor');
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