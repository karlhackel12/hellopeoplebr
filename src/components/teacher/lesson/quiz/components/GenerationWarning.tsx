
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const GenerationWarning: React.FC = () => {
  return (
    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <p>You can try again with fewer questions or a simpler lesson content.</p>
    </div>
  );
};

export default GenerationWarning;
