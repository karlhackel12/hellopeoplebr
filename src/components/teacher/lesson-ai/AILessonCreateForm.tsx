
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LessonFormValues } from '../lesson-editor/useLessonForm';
import GenerationProgress from './components/GenerationProgress';
import { useGenerationApi } from './hooks/useGenerationApi';
import { toast } from 'sonner';

// Define form validation schema
const createLessonSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  level: z.enum(['beginner', 'intermediate', 'advanced'], { 
    required_error: "Please select a level" 
  }),
  instructions: z.string().optional(),
});

type CreateLessonFormValues = z.infer<typeof createLessonSchema>;

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
        
        {!import.meta.env.VITE_USE_EDGE_FUNCTIONS && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Edge Functions Disabled</AlertTitle>
            <AlertDescription>
              Edge functions are currently disabled. AI generation will use the mock API instead.
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>English Lesson Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Present Continuous Tense" 
                      {...field} 
                      disabled={generating || isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>English Proficiency Level</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={generating || isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teaching Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add specific instructions for the English lesson, e.g., 'Focus on business vocabulary' or 'Include pronunciation tips'"
                      className="min-h-[120px] resize-y"
                      {...field}
                      disabled={generating || isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={generating || isLoading || isFormInvalid}
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" /> 
                {generating ? 'Generating...' : 'Generate English Lesson Content'}
              </Button>
            </div>
          </form>
        </Form>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="font-medium">Tips for better English lessons:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Be specific in your title (e.g., "Past Tense Verbs" instead of "Grammar")</li>
            <li>Add clear instructions to focus on specific aspects (conversation, writing, etc.)</li>
            <li>The generated lesson will include vocabulary, key phrases, and quiz questions</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 flex justify-between text-sm text-muted-foreground px-6 py-3">
        <span>Content generated using Replicate AI (deepseek-r1 model)</span>
      </CardFooter>
    </Card>
  );
};

export default AILessonCreateForm;
