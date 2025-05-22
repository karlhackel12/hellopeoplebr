
import { BugsterInstance } from '../types/bugster';

/**
 * Creates a wrapper around the Bugster SDK instance to ensure consistent API
 * regardless of the actual implementation provided by the SDK
 */
export const createBugsterWrapper = (instance: any): BugsterInstance => {
  const wrapper: BugsterInstance = {};
  
  // Return empty wrapper if instance is invalid
  if (!instance) return wrapper;
  
  // Implement captureException
  wrapper.captureException = (error: Error, context?: Record<string, any>) => {
    console.log('Bugster: captureException', error, context);
    
    // Try native method if it exists
    if (typeof instance.captureException === 'function') {
      instance.captureException(error, context);
    } 
    // Try captureMessage as fallback
    else if (typeof instance.captureMessage === 'function') {
      instance.captureMessage(`Error: ${error.message}`, {
        ...context,
        stack: error.stack,
        name: error.name
      });
    }
    // Try other possible methods
    else if (typeof instance.trackException === 'function') {
      instance.trackException(error, context);
    }
    // Last resort: console
    else {
      console.error('Bugster (fallback): ', error, context);
    }
  };
  
  // Implement captureMessage
  wrapper.captureMessage = (message: string, context?: Record<string, any>) => {
    console.log('Bugster: captureMessage', message, context);
    
    // Try native method if it exists
    if (typeof instance.captureMessage === 'function') {
      instance.captureMessage(message, context);
    } 
    // Try other possible methods as fallback
    else if (typeof instance.trackMessage === 'function') {
      instance.trackMessage(message, context);
    }
    else if (typeof instance.track === 'function') {
      instance.track('message', { message, ...context });
    }
    // Last resort: console
    else {
      console.info('Bugster (fallback): ', message, context);
    }
  };
  
  // Implement setUser
  wrapper.setUser = (userId: string, userData?: Record<string, any>) => {
    console.log('Bugster: setUser', userId, userData);
    
    // Try native method if it exists
    if (typeof instance.setUser === 'function') {
      instance.setUser(userId, userData);
    } 
    // Try other possible methods
    else if (typeof instance.identify === 'function') {
      instance.identify(userId, userData);
    }
    else if (typeof instance.setUserContext === 'function') {
      instance.setUserContext({ id: userId, ...userData });
    }
    // Last resort: console
    else {
      console.info('Bugster (fallback) setUser: ', userId, userData);
    }
  };
  
  return wrapper;
};
