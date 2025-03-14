
import { useState } from 'react';
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
  
  const toast = ({ title, description, variant }: ToastProps) => {
    if (variant === 'destructive') {
      return sonnerToast.error(title || 'Error', {
        description
      });
    }
    
    return sonnerToast(title || 'Notification', {
      description
    });
  };

  return { toast, toasts };
}

// Export a singleton instance for direct usage
const { toast, toasts } = useToast();
export { toast, toasts };
