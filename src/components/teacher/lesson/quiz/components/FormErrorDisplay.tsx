
import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface FormErrorDisplayProps {
  error?: string | null;
  errorDetails?: string | null;
}

const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({
  error,
  errorDetails
}) => {
  if (!error) return null;
  
  return (
    <div className="p-3 border rounded-md bg-red-50 text-red-800 flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
      
      {errorDetails && (
        <div className="text-xs text-red-700 pl-6 mt-1 bg-red-100/50 p-2 rounded">
          <details>
            <summary className="cursor-pointer">Technical details</summary>
            <div className="mt-1 whitespace-pre-wrap">{errorDetails}</div>
          </details>
        </div>
      )}
    </div>
  );
};

export default FormErrorDisplay;
