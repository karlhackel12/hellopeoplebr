
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, Sparkles, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LessonPreview from '@/components/teacher/lesson/LessonPreview';
import QuizPreview from '@/components/teacher/quiz/QuizPreview';

interface LessonGeneratorProps {
  onSave: (lessonData: {
    title: string;
    content: string;
    structured_content?: any;
    quiz_questions?: any[];
  }) => void;
  isSaving: boolean;
}

// More detailed generation phases for better UI feedback
type GenerationPhase = 
  | 'idle' 
  | 'loading' 
  | 'analyzing'
  | 'generating'
  | 'retrying'
  | 'complete' 
  | 'error';

interface FormState {
  title: string;
  level: string;
  instructions: string;
}

const LessonGenerator: React.FC<LessonGeneratorProps> = ({ onSave, isSaving }) => {
  // Form state
  const [formState, setFormState] = useState<FormState>({
    title: '',
    level: 'beginner',
    instructions: '',
  });
  
  // Generation state
  const [generationPhase, setGenerationPhase] = useState<GenerationPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [retryCount, setRetryCount] = useState(0);
  const [generationTimer, setGenerationTimer] = useState<number | null>(null);
  
  // Generated content
  const [generatedLesson, setGeneratedLesson] = useState<any>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle level selection change
  const handleLevelChange = (value: string) => {
    setFormState(prev => ({ ...prev, level: value }));
  };
  
  // Reset the generation state
  const resetGeneration = () => {
    setGeneratedLesson(null);
    setGeneratedQuiz(null);
    setGenerationPhase('idle');
    setError(null);
    setErrorDetails(null);
    setRetryCount(0);
    if (generationTimer) {
      clearTimeout(generationTimer);
      setGenerationTimer(null);
    }
  };
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (generationTimer) {
        clearTimeout(generationTimer);
      }
    };
  }, [generationTimer]);
  
  // Generate lesson content with retry logic
  const generateLesson = async (isRetry = false) => {
    if (!formState.title.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }
    
    try {
      if (!isRetry) {
        resetGeneration();
      }
      
      // Set appropriate loading state
      if (isRetry) {
        setGenerationPhase('retrying');
        setRetryCount(prev => prev + 1);
        toast.info('Retrying lesson generation...', {
          description: `Attempt ${retryCount + 1}`
        });
      } else {
        setGenerationPhase('loading');
      }
      
      // Set a timer to show more detailed loading states to improve perceived performance
      const loadingStateTimer = setTimeout(() => {
        setGenerationPhase('analyzing');
        
        const generatingTimer = setTimeout(() => {
          setGenerationPhase('generating');
        }, 3000);
        
        setGenerationTimer(generatingTimer as unknown as number);
      }, 2000);
      
      setGenerationTimer(loadingStateTimer as unknown as number);
      
      // Call edge function with timeout handling
      const response = await supabase.functions.invoke('generate-lesson-content', {
        body: {
          title: formState.title,
          level: formState.level,
          instructions: formState.instructions
        },
        // Set a reasonable timeout for the client
        abortSignal: new AbortController().signal
      });
      
      // Clear any timers
      if (generationTimer) {
        clearTimeout(generationTimer);
        setGenerationTimer(null);
      }
      
      // Check for errors
      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate lesson content');
      }
      
      // Check response status
      if (response.data.status === 'failed') {
        throw new Error(response.data.error || 'Content generation failed');
      }
      
      if (response.data.status === 'succeeded') {
        setGeneratedLesson(response.data.lesson);
        setGeneratedQuiz(response.data.quiz);
        setGenerationPhase('complete');
        toast.success('Lesson generated successfully!');
      } else {
        throw new Error('Content generation failed with an unknown error');
      }
    } catch (error: any) {
      console.error('Error generating lesson:', error);
      
      // Clear any timers
      if (generationTimer) {
        clearTimeout(generationTimer);
        setGenerationTimer(null);
      }
      
      setGenerationPhase('error');
      setError(error.message || 'An unexpected error occurred');
      
      // Extract more detailed error information if available
      let details = null;
      try {
        if (typeof error.message === 'string' && error.message.includes('{')) {
          const jsonStart = error.message.indexOf('{');
          const jsonData = JSON.parse(error.message.substring(jsonStart));
          details = jsonData.details || jsonData.error || null;
        }
      } catch (e) {
        // If parsing fails, use the original error message
        details = null;
      }
      
      setErrorDetails(details);
      
      const isTimeout = error.message && (
        error.message.includes('timed out') || 
        error.message.includes('timeout') || 
        error.message.includes('504')
      );
      
      if (isTimeout) {
        toast.error('Generation timed out', {
          description: 'The lesson generation is taking too long. You can try again.'
        });
      } else {
        toast.error('Failed to generate lesson', {
          description: 'Please try again or modify your input parameters'
        });
      }
    }
  };
  
  // Handle save
  const handleSave = () => {
    if (!generatedLesson) {
      toast.error('No lesson content to save');
      return;
    }
    
    // Format markdown content
    const formattedContent = `
# ${formState.title}

## Description
${generatedLesson.description}

## Key Phrases
${generatedLesson.keyPhrases.map((item: any) => 
  `- **${item.phrase}** - ${item.translation} (${item.usage})`
).join('\n')}

## Vocabulary
${generatedLesson.vocabulary.map((item: any) => 
  `- **${item.word}** (${item.partOfSpeech}) - ${item.translation}`
).join('\n')}
`;
    
    onSave({
      title: formState.title,
      content: formattedContent,
      structured_content: generatedLesson,
      quiz_questions: generatedQuiz?.questions
    });
  };
  
  // Get a user-friendly message based on the generation phase
  const getLoadingMessage = () => {
    switch (generationPhase) {
      case 'loading':
        return 'Preparing to generate lesson...';
      case 'analyzing':
        return 'Analyzing content requirements...';
      case 'generating':
        return 'Creating your lesson and quiz...';
      case 'retrying':
        return `Retrying generation (attempt ${retryCount})...`;
      default:
        return 'Generating your lesson...';
    }
  };
  
  // Render form
  const renderForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Lesson Title</Label>
        <Input 
          id="title"
          name="title"
          placeholder="e.g. Present Simple Tense"
          value={formState.title}
          onChange={handleChange}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="level">Difficulty Level</Label>
        <Select
          value={formState.level}
          onValueChange={handleLevelChange}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="instructions">Special Instructions (Optional)</Label>
        <Textarea
          id="instructions"
          name="instructions"
          placeholder="e.g. Focus on business vocabulary, include audio examples, etc."
          value={formState.instructions}
          onChange={handleChange}
          className="mt-1"
          rows={3}
        />
      </div>
      
      <div className="pt-4">
        <Button 
          onClick={() => generateLesson(false)} 
          disabled={generationPhase === 'loading' || generationPhase === 'analyzing' || generationPhase === 'generating' || generationPhase === 'retrying' || !formState.title.trim()}
          className="w-full md:w-auto gap-2"
        >
          {generationPhase === 'loading' || generationPhase === 'analyzing' || generationPhase === 'generating' || generationPhase === 'retrying' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {getLoadingMessage()}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Lesson Content
            </>
          )}
        </Button>
      </div>
    </div>
  );
  
  // Render preview 
  const renderPreview = () => {
    // Loading states
    if (generationPhase === 'loading' || generationPhase === 'analyzing' || generationPhase === 'generating' || generationPhase === 'retrying') {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-medium mb-2">{getLoadingMessage()}</h2>
          <p className="text-muted-foreground max-w-md">
            {generationPhase === 'retrying' 
              ? 'We\'re giving it another try. This may take a minute or two...'
              : 'This may take a minute or two. We\'re creating a complete lesson with exercises and quiz...'}
          </p>
        </div>
      );
    }
    
    // Error state
    if (generationPhase === 'error') {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-medium mb-2">Generation Failed</h2>
          <p className="text-muted-foreground max-w-md mb-4">
            {error || "Something went wrong while generating your lesson."}
          </p>
          {errorDetails && (
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              {errorDetails}
            </p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={resetGeneration}>Start Over</Button>
            <Button 
              onClick={() => generateLesson(true)} 
              className="gap-2"
              disabled={retryCount >= 3}
            >
              <RefreshCw className="h-4 w-4" />
              Retry Generation
            </Button>
          </div>
          {retryCount >= 3 && (
            <p className="text-sm text-muted-foreground mt-4">
              Maximum retry attempts reached. Try modifying your inputs or try again later.
            </p>
          )}
        </div>
      );
    }
    
    // Complete state
    if (generationPhase === 'complete' && generatedLesson) {
      return (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="content">Lesson Content</TabsTrigger>
              <TabsTrigger value="quiz">Quiz ({generatedQuiz?.questions?.length || 0} Questions)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-4">
              <LessonPreview lesson={generatedLesson} title={formState.title} />
            </TabsContent>
            
            <TabsContent value="quiz" className="mt-4">
              {generatedQuiz?.questions?.length > 0 ? (
                <QuizPreview 
                  questions={generatedQuiz.questions.map((q: any, index: number) => ({
                    id: `preview-${index}`,
                    question_text: q.question_text,
                    question_type: 'multiple_choice',
                    options: q.options.map((opt: any, optIndex: number) => ({
                      id: `preview-opt-${index}-${optIndex}`,
                      option_text: opt.option_text,
                      is_correct: opt.is_correct
                    }))
                  }))}
                  title={`${formState.title} Quiz`}
                  passPercent={70}
                  isPreview={true}
                />
              ) : (
                <div className="text-center py-12 bg-muted rounded-md">
                  <FileText className="h-8 w-8 mx-auto mb-4 text-muted-foreground opacity-60" />
                  <p className="text-muted-foreground">No quiz questions generated</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={resetGeneration}>
              Regenerate
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSaving ? 'Saving...' : 'Save Lesson'}
            </Button>
          </div>
        </div>
      );
    }
    
    // Idle state
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-medium mb-2">Generate a Lesson</h2>
        <p className="text-muted-foreground max-w-md">
          Fill in the form on the left, then click 'Generate Lesson Content' to create a complete lesson with a quiz.
        </p>
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardContent className="p-6">
            {renderForm()}
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-2">
        <Card className="h-full">
          <CardContent className="p-6">
            {renderPreview()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LessonGenerator;
