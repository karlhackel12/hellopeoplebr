
export const useQuizActionWrappers = (
  handleGenerateQuiz: (setContentLoadingMessage: (msg: string | null) => void) => Promise<boolean>,
  handleSaveQuiz: (quizTitle: string) => Promise<boolean>,
  handleDiscardQuiz: () => Promise<boolean>,
  resetPreview: () => void,
  setExistingQuiz: (value: boolean) => void,
  setIsPublished: (value: boolean) => void,
  setShowPreview: (value: boolean) => void,
  setContentLoading: (msg: string | null) => void
) => {
  const wrappedGenerateQuiz = async (numQuestions: string): Promise<void> => {
    setShowPreview(false);
    await handleGenerateQuiz(setContentLoading);
  };

  const wrappedSaveQuiz = async (quizTitle: string): Promise<void> => {
    await handleSaveQuiz(quizTitle);
  };

  const wrappedDiscardQuiz = async (): Promise<void> => {
    const success = await handleDiscardQuiz();
    if (success) {
      resetPreview();
      setExistingQuiz(false);
      setIsPublished(false);
    }
  };

  return {
    wrappedGenerateQuiz,
    wrappedSaveQuiz,
    wrappedDiscardQuiz
  };
};
