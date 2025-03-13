
export const useQuizActionWrappers = (
  handleGenerateQuiz: (setContentLoadingMessage: (msg: string | null) => void) => Promise<void>,
  handleSaveQuiz: (quizTitle: string) => Promise<boolean>,
  handleDiscardQuiz: () => Promise<boolean>,
  resetPreview: () => void,
  setExistingQuiz: (value: boolean) => void,
  setIsPublished: (value: boolean) => void,
  setShowPreview: (value: boolean) => void,
  setContentLoading: (msg: string | null) => void
) => {
  // This wrapper transforms a Promise<boolean> to Promise<void>
  const wrappedGenerateQuiz = async (numQuestions: string): Promise<void> => {
    setShowPreview(false);
    // We ignore the boolean result
    await handleGenerateQuiz(setContentLoading);
    // No return value (void)
  };

  const wrappedSaveQuiz = async (quizTitle: string): Promise<void> => {
    // We ignore the boolean result
    await handleSaveQuiz(quizTitle);
    // No return value (void)
  };

  const wrappedDiscardQuiz = async (): Promise<void> => {
    const success = await handleDiscardQuiz();
    if (success) {
      resetPreview();
      setExistingQuiz(false);
      setIsPublished(false);
    }
    // No return value (void)
  };

  return {
    wrappedGenerateQuiz,
    wrappedSaveQuiz,
    wrappedDiscardQuiz
  };
};
