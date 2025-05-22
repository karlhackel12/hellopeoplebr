
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import BugsterTracker from '@bugster/bugster-js';

interface BugsterContextType {
  bugster: any | null; // Using any temporarily to avoid type issues
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
  const [bugster, setBugster] = useState<any | null>(null);

  // Verifica se a rede está disponível
  const checkNetworkStatus = () => {
    return navigator.onLine;
  };

  // Testa a conexão com o servidor Bugster usando uma função auxiliar
  const testConnection = async () => {
    try {
      // Criamos uma função de teste simples para verificar a conexão
      if (!bugster) {
        console.error('Bugster não está inicializado para testar conexão');
        return false;
      }

      // Usando uma função segura que sabemos que existe no objeto
      await bugster.test && bugster.test();
      console.log('Conexão com Bugster testada com sucesso');
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
        // Inicializamos o Bugster e armazenamos a instância retornada
        const bugsterInstance = BugsterTracker.init({
          apiKey: "bugster_YrA0QUtFB5bjHv63fHhiFTH2SIJvMbszFt0O74my2iqH8btdQ4Gx",
          endpoint: "https://i.bugster.app",
          environment: process.env.NODE_ENV || 'development',
          release: '1.0.0', // Adicione a versão do seu app aqui
          debug: true, // Ative o modo debug para ver os logs no console
        });
        
        // Verificamos se recebemos uma instância válida
        if (bugsterInstance) {
          console.log('Bugster inicializado com sucesso');
          setBugster(bugsterInstance);
          
          // Testamos a conexão depois que a instância estiver disponível
          setTimeout(async () => {
            await testConnection();
          }, 100);
        } else {
          console.error('Falha ao inicializar Bugster: Instância não retornada');
          setConnectionError('Falha ao inicializar Bugster');
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
