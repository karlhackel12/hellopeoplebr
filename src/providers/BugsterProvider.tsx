
import React, { ReactNode, useEffect, useState } from 'react';
// Import BugsterTracker directly to avoid TypeScript errors
import { BugsterTracker } from '@bugster/bugster-js';
import { BugsterInstance } from '../types/bugster';
import BugsterContext from '../context/BugsterContext';
import { createBugsterWrapper } from '../utils/bugsterWrapper';
import { checkNetworkStatus, testBugsterConnection } from '../utils/bugsterConnection';

interface BugsterProviderProps {
  children: ReactNode;
}

export const BugsterProvider = ({ children }: BugsterProviderProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [bugster, setBugster] = useState<BugsterInstance | null>(null);
  const [rawInstance, setRawInstance] = useState<any | null>(null);

  useEffect(() => {
    const initializeBugster = async () => {
      if (bugster) return;
      
      // Check if network connection is available
      if (!checkNetworkStatus()) {
        console.error('Sem conexão de rede. Bugster não inicializado.');
        setConnectionError('Sem conexão de rede');
        return;
      }
      
      try {
        // Log the format of the Bugster SDK
        console.log('Formato do SDK Bugster:', BugsterTracker);
        
        let instance = null;
        
        // Try to initialize using the BugsterTracker constructor
        try {
          console.log('Inicializando Bugster via BugsterTracker constructor');
          instance = new BugsterTracker({
            apiKey: "bugster_xeXxZuTROPArSb4dv5wGg5iD57yFvijitjZhIbHQazAGkU9YSpMP",
            endpoint: "https://i.bugster.app",
            // Removed the release property that was causing the error
            debug: true,
          });
          console.log('Instância do Bugster criada:', instance);
        } catch (error) {
          console.error('Erro ao inicializar Bugster com BugsterTracker:', error);
          
          // If it fails, create a fake implementation
          console.warn('Criando implementação fake do Bugster como fallback');
          instance = {
            _isFake: true,
            _events: []
          };
        }
        
        // Save the original instance for reference
        setRawInstance(instance);
        
        // Create a wrapper with guaranteed methods
        const bugsterWrapper = createBugsterWrapper(instance);
        
        // Check if we created the wrapper successfully
        if (bugsterWrapper) {
          console.log('Bugster wrapper criado com sucesso', bugsterWrapper);
          setBugster(bugsterWrapper);
          
          // Test the connection after the instance is available
          setTimeout(async () => {
            await testBugsterConnection(bugsterWrapper, setIsConnected, setConnectionError);
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
    
    // Monitor changes in network status
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

// Re-export the useBugster hook for convenience
export { useBugster } from '../context/BugsterContext';
