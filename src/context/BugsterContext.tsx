
import React, { createContext, useContext } from 'react';
import { BugsterContextType } from '../types/bugster';

// Create the Bugster context with default values
const BugsterContext = createContext<BugsterContextType>({ 
  bugster: null, 
  isConnected: false,
  connectionError: null
});

/**
 * Custom hook to access the Bugster context
 */
export const useBugster = () => useContext(BugsterContext);

export default BugsterContext;
