
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

type InvitationActionState = {
  processingInvitations: Record<string, boolean>;
  isProcessing: boolean;
};

type InvitationActionHook = InvitationActionState & {
  startProcessing: (id: string) => void;
  stopProcessing: (id: string) => void;
  handleError: (error: any, actionName: string) => void;
};

/**
 * A base hook for invitation actions (resend, delete) that provides
 * shared state management and error handling
 */
export const useInvitationAction = (onUpdate: () => void): InvitationActionHook => {
  const [processingInvitations, setProcessingInvitations] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const startProcessing = useCallback((id: string) => {
    setProcessingInvitations(prev => ({ ...prev, [id]: true }));
    setIsProcessing(true);
  }, []);

  const stopProcessing = useCallback((id: string) => {
    setProcessingInvitations(prev => ({ ...prev, [id]: false }));
    setIsProcessing(false);
    
    // Force data refresh
    onUpdate();
    
    // Schedule another refresh after a delay to ensure database consistency
    setTimeout(() => {
      onUpdate();
    }, 500);
  }, [onUpdate]);

  const handleError = useCallback((error: any, actionName: string) => {
    console.error(`Error ${actionName}:`, error);
    toast.error(`Failed to ${actionName}`, {
      description: error.message || 'An unexpected error occurred.',
    });
  }, []);

  return {
    processingInvitations,
    isProcessing,
    startProcessing,
    stopProcessing,
    handleError
  };
};

