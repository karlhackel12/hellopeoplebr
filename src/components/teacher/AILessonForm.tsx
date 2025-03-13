
import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LessonFormValues } from './lesson-editor/useLessonForm';
import { LessonPreview } from './LessonPreview';
import GenerationSettingsForm from './lesson-ai/GenerationSettingsForm';
import ContentPreview from './lesson-ai/ContentPreview';
import { useAIGeneration } from './lesson-ai/useAIGeneration';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuizData } from './preview/useQuizData';
import QuizTab from './preview/QuizTab';

interface AILessonFormProps {
  form: UseFormReturn<LessonFormValues>;
  title: string;
}

const AILessonForm: React.FC<AILessonFormProps> = ({
  form,
  title
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'preview' | 'student'>('generate');
  const [editMode, setEditMode] = useState(false);
  const {
    generating,
    generatedContent,
    level,
    setLevel,
    instructions,
    setInstructions,
    handleGenerate,
    handleCancelGeneration,
    handleRetryGeneration,
    error,
    clearErrors,
    generationStatus,
    generationPhase,
    progressPercentage,
    statusMessage
  } = useAIGeneration(form, title);

  // Get the form values and use optional chaining for id
  const formValues = form.getValues();
  const lessonId = formValues.id;
  const { quizQuestions, quizTitle, quizPassPercent, loadingQuiz, quizExists, isQuizPublished } = useQuizData(lessonId);

  useEffect(() => {
    if (generatedContent && activeTab === 'generate' && generationStatus === 'completed') {
      setActiveTab('preview');
    }
  }, [generatedContent, generationStatus, activeTab]);

  useEffect(() => {
    if (clearErrors) {
      clearErrors();
    }
  }, [activeTab, clearErrors]);

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      form.setValue('contentSource', 'mixed');
    }
  };

  useEffect(() => {
    if (activeTab === 'student') {
      setEditMode(false);
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {!import.meta.env.VITE_REPLICATE_API_KEY && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Replicate API key is missing. Please add REPLICATE_API_KEY in your environment variables.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={value => setActiveTab(value as any)}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger 
            value="generate" 
            disabled={generating && generationPhase !== 'error'}
          >
            Generation Settings
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedContent}>
            Content Editor
          </TabsTrigger>
          <TabsTrigger value="student" disabled={!generatedContent}>
            Student View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="pt-4">
          <GenerationSettingsForm 
            title={title} 
            level={level} 
            setLevel={setLevel} 
            instructions={instructions} 
            setInstructions={setInstructions} 
            handleGenerate={handleGenerate} 
            handleCancel={generating ? handleCancelGeneration : undefined}
            handleRetry={generationPhase === 'error' ? handleRetryGeneration : undefined} 
            generating={generating} 
            error={error} 
            generationPhase={generationPhase}
            progressPercentage={progressPercentage}
            statusMessage={statusMessage}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="pt-4">
          {generatedContent && (
            <ContentPreview 
              form={form} 
              generatedContent={generatedContent} 
              editMode={editMode} 
              toggleEditMode={toggleEditMode} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="student" className="pt-4">
          {generatedContent ? (
            <div className="space-y-8">
              <LessonPreview 
                content={form.watch('content')} 
                title={form.watch('title')} 
              />
              
              {quizExists && quizQuestions.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <h2 className="text-xl font-semibold mb-4">Lesson Quiz</h2>
                  <div className="bg-card rounded-lg shadow-sm p-4">
                    <QuizTab 
                      lessonId={lessonId || ''} 
                      loadingQuiz={loadingQuiz}
                      quizExists={quizExists}
                      quizQuestions={quizQuestions}
                      quizTitle={quizTitle}
                      quizPassPercent={quizPassPercent}
                      isQuizPublished={isQuizPublished}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md bg-muted">
              <p className="text-muted-foreground">Generate content first to see student view</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AILessonForm;
