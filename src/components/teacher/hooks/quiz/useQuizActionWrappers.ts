
export const useQuizActionWrappers = (
  handleGenerateQuiz: (numQuestions: string, setContentLoading: (msg: string | null) => void) => Promise<boolean>,
  handleSaveQuiz: (quizTitle: string) => Promise<boolean>,
  handleDiscardQuiz: () => Promise<boolean>,
  resetPreview: () => void,
  setExistingQuiz: (value: boolean) => void,
  setIsPublished: (value: boolean) => void,
  setShowPreview: (value: boolean) => void,
  setContentLoading: (msg: string | null) => void
) => {
  const wrappedGenerateQuiz = async (): Promise<boolean> => {
    setShowPreview(false);
    return await handleGenerateQuiz(setContentLoading);
  };

  const wrappedSaveQuiz = async (quizTitle: string): Promise<boolean> => {
    return await handleSaveQuiz(quizTitle);
  };

  const wrappedDiscardQuiz = async (): Promise<boolean> => {
    const success = await handleDiscardQuiz();
    if (success) {
      resetPreview();
      setExistingQuiz(false);
      setIsPublished(false);
    }
    return success;
  };

  return {
    wrappedGenerateQuiz,
    wrappedSaveQuiz,
    wrappedDiscardQuiz
  };
};
