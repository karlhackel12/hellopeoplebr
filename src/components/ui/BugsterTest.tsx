
import React, { useEffect, useState } from 'react';
import { useBugsterTracker } from '@/hooks/useBugsterTracker';
import { useBugster } from '@/providers/BugsterProvider';
import { Button } from './button';

export const BugsterTest: React.FC = () => {
  const {
    logError,
    logMessage,
    bugster,
    isConnected,
    connectionError
  } = useBugsterTracker();

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
      setTestResults(prev => [...prev, {
        message: 'Componente inicializado e mensagem enviada',
        type: 'info',
        timestamp: new Date().toISOString()
      }]);
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
      setTestResults(prev => [...prev, {
        message: 'Erro de teste enviado ao Bugster',
        type: 'error',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleTestMessage = () => {
    logMessage('Mensagem de teste do Bugster', {
      component: 'BugsterTest',
      action: 'testMessageButton',
      timestamp: new Date().toISOString()
    });
    setTestResults(prev => [...prev, {
      message: 'Mensagem de teste enviada ao Bugster',
      type: 'success',
      timestamp: new Date().toISOString()
    }]);
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
      wrapper: bugster ? {
        hasCaptureException: !!bugster.captureException,
        hasCaptureMessage: !!bugster.captureMessage,
        hasSetUser: !!bugster.setUser
      } : null
    });
    setTestResults(prev => [...prev, {
      message: 'Status do SDK registrado no console',
      type: 'info',
      timestamp: new Date().toISOString()
    }]);
  };

  const checkMethods = () => {
    const methods = {
      captureException: bugster?.captureException ? "✅" : "❌",
      captureMessage: bugster?.captureMessage ? "✅" : "❌",
      setUser: bugster?.setUser ? "✅" : "❌"
    };
    return (
      <div className="text-xs mt-2 font-mono bg-gray-100 p-2 rounded">
        <div>captureException: {methods.captureException}</div>
        <div>captureMessage: {methods.captureMessage}</div>
        <div>setUser: {methods.setUser}</div>
      </div>
    );
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Bugster Test Component</h2>
      
      <div className="mb-4">
        <div className={`font-medium ${getStatusColor()}`}>
          Status: {getStatusText()}
        </div>
        {checkMethods()}
      </div>

      <div className="space-y-2 mb-4">
        <Button onClick={handleTestMessage} className="mr-2">
          Testar Mensagem
        </Button>
        <Button onClick={handleTestError} variant="destructive" className="mr-2">
          Testar Erro
        </Button>
        <Button onClick={logSDKStatus} variant="outline">
          Log Status
        </Button>
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-2">Resultados dos Testes:</h3>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className={`text-xs p-2 rounded ${
              result.type === 'success' ? 'bg-green-100 text-green-800' :
              result.type === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              <span className="font-mono">{result.timestamp}</span>: {result.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
