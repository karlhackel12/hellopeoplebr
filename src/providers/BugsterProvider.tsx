import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { BugsterTracker } from '@bugster/bugster-js';

interface BugsterContextType {
  bugster: BugsterTracker | null;
}

const BugsterContext = createContext<BugsterContextType>({ bugster: null });

export const useBugster = () => useContext(BugsterContext);

interface BugsterProviderProps {
  children: ReactNode;
}

export const BugsterProvider = ({ children }: BugsterProviderProps) => {
  const [bugster, setBugster] = React.useState<BugsterTracker | null>(null);

  useEffect(() => {
    if (!bugster) {
      const bugsterInstance = new BugsterTracker({
        apiKey: "bugster_YrA0QUtFB5bjHv63fHhiFTH2SIJvMbszFt0O74my2iqH8btdQ4Gx",
        endpoint: "https://i.bugster.app",
      });
      console.log('Bugster initialized:', bugsterInstance);
      setBugster(bugsterInstance);
    }
  }, [bugster]);

  return (
    <BugsterContext.Provider value={{ bugster }}>
      {children}
    </BugsterContext.Provider>
  );
}; 