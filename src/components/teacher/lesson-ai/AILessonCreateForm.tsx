
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { LessonFormValues } from '../lesson-editor/useLessonForm';
import { useGenerationApi } from './hooks/useGenerationApi';
import { toast } from 'sonner';

// Import our newly created components
import GenerationProgress from './components/GenerationProgress';
import LessonFormFields, { createLessonSchema, CreateLessonFormValues } from './components/LessonFormFields';
import LessonFormTips from './components/LessonFormTips';
import EdgeFunctionAlert from './components/EdgeFunctionAlert';
import GenerateButton from './components/GenerateButton';

interface AILessonCreateFormProps {
  onSubmit: (data: LessonFormValues) => void;
  isLoading: boolean;
}

const AILessonCreateForm: React.FC<AILessonCreateFormProps> = ({ onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<'idle' | 'starting' | 'generating' | 'complete' | 'error'>('idle');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { invokeLessonGeneration } = useGenerationApi();
  
  const form = useForm<CreateLessonFormValues>({
    resolver: zodResolver(createLessonSchema),
    defaultValues: {
      title: "",
      level: "beginner",
      instructions: "",
    },
  });

  // Check if form is valid
  const isFormInvalid = !form.formState.isValid || form.formState.errors.title !== undefined;

  const handleGenerate = async (values: CreateLessonFormValues) => {
    setGenerating(true);
    setGenerationPhase('starting');
    setProgressPercentage(10);
    setStatusMessage('Initializing AI generation...');
    setError(null);
    
    try {
      // Create timestamp for this generation
      const timestamp = new Date().toISOString();
      
      setGenerationPhase('generating');
      setProgressPercentage(30);
      setStatusMessage('Generating lesson content with AI...');
      
      // Call the edge function
      const generationResult = await invokeLessonGeneration({
        title: values.title,
        level: values.level,
        language: 'English',
        subject: 'English',
        instructions: values.instructions,
        timestamp: timestamp
      });
      
      if (generationResult.status === 'succeeded' && generationResult.lesson) {
        setGenerationPhase('complete');
        setProgressPercentage(100);
        setStatusMessage('Generation complete!');
        
        // Create the complete lesson form values
        const lessonFormValues: LessonFormValues = {
          title: values.title,
          content: '', // Will be formatted from structured content
          is_published: false,
          contentSource: 'ai_generated',
          structuredContent: generationResult.lesson,
          generationMetadata: {
            level: values.level,
            timestamp: timestamp,
            model: 'deepseek-r1',
            instructions: values.instructions,
            completed: new Date().toISOString(),
            status: 'succeeded'
          },
          estimated_minutes: 15,
        };
        
        // Call the parent onSubmit handler
        onSubmit(lessonFormValues);
        
        toast.success('Content Generated', {
          description: 'Your lesson content has been successfully generated'
        });
      } else {
        throw new Error('Generation failed or returned invalid content');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      setGenerationPhase('error');
      setError(error.message || 'An unexpected error occurred');
      setGenerating(false);
    }
  };

  const handleCancel = () => {
    if (generating) {
      // We can't actually cancel the edge function once it's started,
      // but we can stop the UI from waiting for it
      setGenerating(false);
      setGenerationPhase('idle');
      setProgressPercentage(0);
      setStatusMessage('');
      toast.info('Generation cancelled', {
        description: 'The generation process was cancelled'
      });
    }
  };

  return (
    <Card className="w-full border border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Create AI-Generated English Lesson</CardTitle>
        <CardDescription>Generate a complete English lesson using advanced AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {generating && (
          <GenerationProgress
            phase={generationPhase}
            progress={progressPercentage}
            statusMessage={statusMessage}
            error={error}
            onCancel={handleCancel}
            onRetry={form.handleSubmit(handleGenerate)}
          />
        )}
        
        <EdgeFunctionAlert />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
            <LessonFormFields
              form={form}
              generating={generating}
              isLoading={isLoading}
            />
            
            <GenerateButton
              generating={generating}
              isLoading={isLoading}
              isFormInvalid={isFormInvalid}
            />
          </form>
        </Form>
        
        <LessonFormTips />
      </CardContent>
      <CardFooter className="bg-muted/30 flex justify-between text-sm text-muted-foreground px-6 py-3">
        <span>Content generated using Replicate AI (deepseek-r1 model)</span>
      </CardFooter>
    </Card>
  );
};

export default AILessonCreateForm;
