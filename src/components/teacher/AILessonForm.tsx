
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

interface AILessonFormProps {
  form: UseFormReturn<LessonFormValues>;
  title: string;
}

const AILessonForm: React.FC<AILessonFormProps> = ({ form, title }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'preview' | 'edit'>('generate');
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
    error,
    clearErrors,
    generationStatus,
    progress
  } = useAIGeneration(form, title);

  // When generation completes, switch to preview tab
  useEffect(() => {
    if (generatedContent && activeTab === 'generate' && generationStatus === 'completed') {
      setActiveTab('preview');
    }
  }, [generatedContent, generationStatus, activeTab]);

  // Reset errors when changing tabs
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

  return (
    <div className="space-y-6">
      {!import.meta.env.VITE_REPLICATE_API_KEY && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The AI generation feature requires a Replicate API key to be configured in Supabase Edge Function secrets.
            Please contact your administrator to set this up.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="generate" disabled={generating && generationStatus !== 'failed'}>Generation Settings</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedContent}>Content Preview</TabsTrigger>
          <TabsTrigger value="edit" disabled={!generatedContent}>Student View</TabsTrigger>
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
            generating={generating}
            error={error}
            generationStatus={generationStatus}
            progress={progress}
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
        <TabsContent value="edit" className="pt-4">
          {generatedContent ? (
            <LessonPreview content={form.watch('content')} />
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
