
import { toast } from 'sonner';

export const useValidation = (setGenerating: (generating: boolean) => void, setGenerationStatus: (status: string) => void) => {
  const validateTitleInput = (title: string): boolean => {
    if (!title?.trim()) {
      toast.error("Title required", {
        description: "Please provide a lesson title before generating content",
      });
      setGenerating(false);
      setGenerationStatus('failed');
      return false;
    }
    return true;
  };

  return {
    validateTitleInput
  };
};
