
import { useState, useCallback } from 'react';
import { toast as sonnerToast } from 'sonner';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export type Toast = ToastProps & {
  id: string | number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const toast = useCallback(({ title, description, variant }: ToastProps) => {
    if (variant === 'destructive') {
      return sonnerToast.error(title || 'Error', {
        description
      });
    }
    
    return sonnerToast(title || 'Notification', {
      description
    });
  }, []);

  return { toast, toasts };
}

// Create a singleton instance that can be imported directly
// This avoids the "Invalid hook call" error since we're not using hooks at the module level
const createToast = ({ title, description, variant }: ToastProps) => {
  if (variant === 'destructive') {
    return sonnerToast.error(title || 'Error', {
      description
    });
  }
  
  return sonnerToast(title || 'Notification', {
    description
  });
};

export { createToast as toast };
