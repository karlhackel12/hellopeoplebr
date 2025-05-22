
import { BugsterInstance } from '../types/bugster';

/**
 * Creates a wrapper around the Bugster SDK instance to ensure consistent API
 * regardless of the actual implementation provided by the SDK
 */
export const createBugsterWrapper = (instance: any): BugsterInstance => {
  console.log('Criando wrapper para instância:', instance);
  
  const wrapper: BugsterInstance = {};
  
  // Return empty wrapper if instance is invalid
  if (!instance) {
    console.warn('Instância Bugster inválida, criando wrapper vazio');
    return wrapper;
  }
  
  // Log the instance properties to debug
  console.log('Propriedades da instância:', Object.keys(instance));
  console.log('Métodos da instância:', 
    Object.keys(instance).filter(key => typeof instance[key] === 'function'));
  
  // Implement captureException
  wrapper.captureException = (error: Error, context?: Record<string, any>) => {
    console.log('Bugster wrapper: captureException', error, context);
    
    // Try native method if it exists
    if (typeof instance.captureException === 'function') {
      console.log('Usando método nativo captureException');
      instance.captureException(error, context);
    } 
    // Try captureMessage as fallback
    else if (typeof instance.captureMessage === 'function') {
      console.log('Usando método nativo captureMessage como fallback para erro');
      instance.captureMessage(`Error: ${error.message}`, {
        ...context,
        stack: error.stack,
        name: error.name
      });
    }
    // Try other possible methods
    else if (typeof instance.trackException === 'function') {
      console.log('Usando método trackException como fallback');
      instance.trackException(error, context);
    }
    // Last resort: console
    else {
      console.error('Bugster (fallback): ', error, context);
    }
  };
  
  // Implement captureMessage
  wrapper.captureMessage = (message: string, context?: Record<string, any>) => {
    console.log('Bugster wrapper: captureMessage', message, context);
    
    // Try native method if it exists
    if (typeof instance.captureMessage === 'function') {
      console.log('Usando método nativo captureMessage');
      instance.captureMessage(message, context);
    } 
    // Try other possible methods as fallback
    else if (typeof instance.trackMessage === 'function') {
      console.log('Usando método trackMessage como fallback');
      instance.trackMessage(message, context);
    }
    else if (typeof instance.track === 'function') {
      console.log('Usando método track como fallback');
      instance.track('message', { message, ...context });
    }
    // Last resort: console
    else {
      console.info('Bugster (fallback): ', message, context);
    }
  };
  
  // Implement setUser
  wrapper.setUser = (userId: string, userData?: Record<string, any>) => {
    console.log('Bugster wrapper: setUser', userId, userData);
    
    // Try native method if it exists
    if (typeof instance.setUser === 'function') {
      console.log('Usando método nativo setUser');
      instance.setUser(userId, userData);
    } 
    // Try other possible methods
    else if (typeof instance.identify === 'function') {
      console.log('Usando método identify como fallback');
      instance.identify(userId, userData);
    }
    else if (typeof instance.setUserContext === 'function') {
      console.log('Usando método setUserContext como fallback');
      instance.setUserContext({ id: userId, ...userData });
    }
    // Last resort: console
    else {
      console.info('Bugster (fallback) setUser: ', userId, userData);
    }
  };
  
  console.log('Wrapper criado com sucesso:', wrapper);
  console.log('Métodos do wrapper:', Object.keys(wrapper));
  
  return wrapper;
};
