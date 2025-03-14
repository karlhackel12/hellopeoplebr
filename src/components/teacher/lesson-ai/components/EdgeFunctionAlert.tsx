
import React from 'react';
import { Alert, AlertCircle, AlertTitle, AlertDescription } from '@/components/ui/alert';

const EdgeFunctionAlert: React.FC = () => {
  if (import.meta.env.VITE_USE_EDGE_FUNCTIONS) {
    return null;
  }
  
  return (
    <Alert variant="warning">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Edge Functions Disabled</AlertTitle>
      <AlertDescription>
        Edge functions are currently disabled. AI generation will use the mock API instead.
      </AlertDescription>
    </Alert>
  );
};

export default EdgeFunctionAlert;
