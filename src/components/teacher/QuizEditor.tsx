
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import QuizSettings from './quiz/QuizSettings';
import QuestionForm from './quiz/QuestionForm';
import QuestionList from './quiz/QuestionList';
import { useQuizData } from './quiz/hooks/useQuizData';
import { useQuestionManager } from './quiz/hooks/useQuestionManager';

interface QuizEditorProps {
  lessonId: string;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ lessonId }) => {
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
    saving: savingQuiz,
    saveQuiz,
    fetchQuizData,
  } = useQuizData(lessonId);

  const {
    currentQuestion,
    addingQuestion,
    saving: savingQuestion,
    addQuestion,
    editQuestion,
    cancelQuestionEdit,
    handleQuestionChange,
    handleOptionChange,
    addOption,
    removeOption,
    saveQuestion,
    deleteQuestion,
  } = useQuestionManager(quiz?.id, fetchQuizData);

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
        saving={savingQuiz}
        onSave={saveQuiz}
      />

      {quiz ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Questions</h2>
            {!addingQuestion && (
              <Button onClick={() => addQuestion(questions.length)} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Question
              </Button>
            )}
          </div>

          {addingQuestion ? (
            <QuestionForm
              currentQuestion={currentQuestion}
              saving={savingQuestion}
              onQuestionChange={handleQuestionChange}
              onOptionChange={handleOptionChange}
              onAddOption={addOption}
              onRemoveOption={removeOption}
              onCancel={cancelQuestionEdit}
              onSave={saveQuestion}
            />
          ) : null}

          <QuestionList
            questions={questions}
            onEditQuestion={editQuestion}
            onDeleteQuestion={deleteQuestion}
          />
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md bg-muted">
          <p className="mb-4">Create a quiz for this lesson</p>
          <Button onClick={saveQuiz} disabled={!title}>
            Create Quiz
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizEditor;
