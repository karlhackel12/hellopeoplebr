
import React, { useEffect, useState } from 'react';
import { useBugsterTracker } from '@/hooks/useBugsterTracker';
import { useBugster } from '@/providers/BugsterProvider';
import { Button } from './button';

export const BugsterTest: React.FC = () => {
  const { logError, logMessage, bugster } = useBugsterTracker();
  const { isConnected, connectionError } = useBugster();
  const [testResults, setTestResults] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    timestamp: string;
  }[]>([]);

  useEffect(() => {
    // Enviar mensagem ao carregar o componente
    if (bugster) {
      logMessage('BugsterTest componente carregado', {
        component: 'BugsterTest',
        action: 'componentLoad',
        timestamp: new Date().toISOString()
      });

      setTestResults(prev => [
        ...prev,
        {
          message: 'Componente inicializado e mensagem enviada',
          type: 'info',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [logMessage, bugster]);

  const handleTestError = () => {
    try {
      // Forçar um erro para testar
      throw new Error('Erro de teste do Bugster');
    } catch (error) {
      logError(error, {
        component: 'BugsterTest',
        action: 'testErrorButton',
        timestamp: new Date().toISOString()
      });
      
      setTestResults(prev => [
        ...prev,
        {
          message: 'Erro de teste enviado ao Bugster',
          type: 'error',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const handleTestMessage = () => {
    logMessage('Mensagem de teste do Bugster', {
      component: 'BugsterTest',
      action: 'testMessageButton',
      timestamp: new Date().toISOString()
    });
    
    setTestResults(prev => [
      ...prev,
      {
        message: 'Mensagem de teste enviada ao Bugster',
        type: 'success',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const getStatusColor = () => {
    if (isConnected) return 'text-green-600';
    if (connectionError) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStatusText = () => {
    if (isConnected) return 'Conectado';
    if (connectionError) return `Desconectado: ${connectionError}`;
    return 'Inicializando...';
  };

  const logSDKStatus = () => {
    console.log("Bugster SDK status:", {
      isInitialized: !!bugster,
      isConnected,
      connectionError,
      methods: bugster ? Object.keys(bugster).filter(k => typeof bugster[k] === 'function') : []
    });

    setTestResults(prev => [
      ...prev,
      {
        message: 'Status do SDK registrado no console',
        type: 'info',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
      <h2 className="text-lg font-medium">Teste do Bugster SDK</h2>
      <div className="space-y-2">
        <p>SDK: {bugster ? 'Inicializado' : 'Não inicializado'}</p>
        <p className={getStatusColor()}>
          Status: {getStatusText()}
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={handleTestError} variant="destructive">
            Testar Erro
          </Button>
          <Button onClick={handleTestMessage} variant="outline">
            Testar Mensagem
          </Button>
          <Button onClick={logSDKStatus} variant="secondary">
            Verificar SDK no Console
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="mt-4 border-t pt-2">
            <h3 className="font-medium">Resultados dos testes:</h3>
            <div className="max-h-40 overflow-y-auto mt-2">
              {testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`text-sm mb-1 p-1 rounded ${
                    result.type === 'error' 
                      ? 'bg-red-50 text-red-700' 
                      : result.type === 'success' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{result.message}</span>
                    <span className="text-xs opacity-70">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
