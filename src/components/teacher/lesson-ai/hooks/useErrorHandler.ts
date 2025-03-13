
import { toast } from 'sonner';

export const useErrorHandler = (setError: (error: string | null) => void, setGenerating: (generating: boolean) => void, setGenerationStatus: (status: string) => void) => {
  const handleGenerationError = (error: any) => {
    console.error("Error generating lesson content:", error);
    setError(error?.message || "Failed to generate content");
    setGenerating(false);
    setGenerationStatus('failed');
    
    toast.error("Generation failed", {
      description: error?.message || "Failed to generate lesson content",
    });
  };

  const handleParsingError = (error: any) => {
    console.error("Error parsing AI response:", error);
    throw new Error(`Failed to process the generated content: ${error.message}`);
  };

  const handleContentUpdateError = (error: any) => {
    console.error("Error updating content:", error);
    toast.error("Update failed", {
      description: error?.message || "Failed to update lesson content",
    });
  };

  return {
    handleGenerationError,
    handleParsingError,
    handleContentUpdateError
  };
};
