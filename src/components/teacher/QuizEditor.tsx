
import React from 'react';
import QuizSettings from './quiz/QuizSettings';
import QuestionManager from './quiz/components/QuestionManager';
import QuizCreationPanel from './quiz/components/QuizCreationPanel';
import { useQuizEditor } from './quiz/hooks/useQuizEditor';
import { useQuestionEditor } from './quiz/hooks/useQuestionEditor';

interface QuizEditorProps {
  quizId?: string;
  lessonId?: string;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ quizId, lessonId }) => {
  // Quiz state and operations
  const {
    quiz,
    questions,
    title,
    setTitle,
    description,
    setDescription,
    passPercent,
    setPassPercent,
    isPublished,
    setIsPublished,
    loading,
    saving,
    fetchQuizData,
    saveQuiz
  } = useQuizEditor(quizId, lessonId);

  // Question editing state and operations
  const {
    currentQuestion,
    addingQuestion,
    savingQuestion,
    addQuestion,
    editQuestion,
    cancelQuestionEdit,
    handleQuestionChange,
    handleOptionChange,
    addOption,
    removeOption,
    saveQuestion,
    deleteQuestion
  } = useQuestionEditor(quiz?.id || '', fetchQuizData);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p>Loading quiz data...</p>
      </div>
    );
  }

  return (
    <div>
      <QuizSettings
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        passPercent={passPercent}
        setPassPercent={setPassPercent}
        isPublished={isPublished}
        setIsPublished={setIsPublished}
        saving={saving}
        onSave={saveQuiz}
      />

      {quiz ? (
        <QuestionManager
          questions={questions}
          currentQuestion={currentQuestion}
          addingQuestion={addingQuestion}
          savingQuestion={savingQuestion}
          onAddQuestion={() => addQuestion(questions.length)}
          onEditQuestion={editQuestion}
          onDeleteQuestion={deleteQuestion}
          onQuestionChange={handleQuestionChange}
          onOptionChange={handleOptionChange}
          onAddOption={addOption}
          onRemoveOption={removeOption}
          onCancelEdit={cancelQuestionEdit}
          onSaveQuestion={saveQuestion}
        />
      ) : (
        <QuizCreationPanel
          title="Create Quiz"
          onCreateQuiz={saveQuiz}
          disabled={!title}
        />
      )}
    </div>
  );
};

export default QuizEditor;
