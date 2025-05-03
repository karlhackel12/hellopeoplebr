import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import QuizSettings from './quiz/QuizSettings';
import QuestionForm from './quiz/QuestionForm';
import QuestionList from './quiz/QuestionList';
import { useQuizData } from './quiz/hooks/useQuizData';
import { useQuestionManager } from './quiz/hooks/useQuestionManager';
import { useAnalytics, ANALYTICS_EVENTS } from '@/hooks/useAnalytics';

interface QuizEditorProps {
  lessonId: string;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ lessonId }) => {
  const { trackEvent } = useAnalytics();
  
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

  // Track quiz editor initial load
  useEffect(() => {
    if (!loading && quiz) {
      trackEvent(ANALYTICS_EVENTS.UI.NAVIGATION, {
        page: 'quiz_editor',
        quiz_id: quiz.id,
        lesson_id: lessonId,
        is_published: isPublished,
        questions_count: questions.length
      });
    }
  }, [loading, quiz, lessonId, isPublished, questions.length, trackEvent]);

  // Enhanced saveQuiz function with analytics
  const handleSaveQuiz = async () => {
    await saveQuiz();
    
    // Track quiz update
    if (quiz) {
      trackEvent(ANALYTICS_EVENTS.TEACHER.QUIZ_UPDATED, {
        quiz_id: quiz.id,
        lesson_id: lessonId,
        is_published: isPublished,
        questions_count: questions.length,
        title_length: title.length
      });
    } else {
      // This is a new quiz creation
      trackEvent(ANALYTICS_EVENTS.TEACHER.QUIZ_CREATED, {
        lesson_id: lessonId,
        title_length: title.length
      });
    }
  };

  // Enhanced saveQuestion function with analytics
  const handleSaveQuestion = async () => {
    await saveQuestion();
    
    // Track question creation/update
    trackEvent(ANALYTICS_EVENTS.UI.FORM_SUBMITTED, {
      form: 'quiz_question',
      quiz_id: quiz?.id,
      action: currentQuestion.id ? 'update' : 'create',
      options_count: currentQuestion.options.length
    });
  };

  // Enhanced deleteQuestion function with analytics
  const handleDeleteQuestion = async (questionId: string) => {
    await deleteQuestion(questionId);
    
    // Track question deletion
    trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
      button: 'delete_question',
      quiz_id: quiz?.id
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p>Carregando dados do questionário...</p>
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
        onSave={handleSaveQuiz}
      />

      {quiz ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Perguntas</h2>
            {!addingQuestion && (
              <Button 
                onClick={() => {
                  addQuestion(questions.length);
                  trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
                    button: 'add_question',
                    quiz_id: quiz.id
                  });
                }} 
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Adicionar Pergunta
              </Button>
            )}
          </div>

          {addingQuestion ? (
            <QuestionForm
              currentQuestion={currentQuestion}
              saving={savingQuestion}
              onQuestionChange={handleQuestionChange}
              onOptionChange={handleOptionChange}
              onAddOption={() => {
                addOption();
                trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
                  button: 'add_option',
                  quiz_id: quiz.id
                });
              }}
              onRemoveOption={(index) => {
                removeOption(index);
                trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
                  button: 'remove_option',
                  quiz_id: quiz.id
                });
              }}
              onCancel={() => {
                cancelQuestionEdit();
                trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
                  button: 'cancel_question_edit',
                  quiz_id: quiz.id
                });
              }}
              onSave={handleSaveQuestion}
            />
          ) : null}

          <QuestionList
            questions={questions}
            onEditQuestion={(question) => {
              editQuestion(question);
              trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
                button: 'edit_question',
                quiz_id: quiz.id,
                question_id: question.id
              });
            }}
            onDeleteQuestion={handleDeleteQuestion}
          />
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md bg-muted">
          <p className="mb-4">Crie um questionário para esta lição</p>
          <Button onClick={handleSaveQuiz} disabled={!title}>
            Criar Questionário
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizEditor;
