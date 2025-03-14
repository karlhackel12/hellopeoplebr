
import { toast as sonnerToast } from 'sonner';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
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

  return { toast };
}
