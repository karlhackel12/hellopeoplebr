
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, MessageSquare, AlertCircle, StopCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress'; 

interface GenerationSettingsFormProps {
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  setLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
  instructions: string;
  setInstructions: (instructions: string) => void;
  handleGenerate: () => Promise<void>;
  handleCancel?: () => void;
  generating: boolean;
  error?: string | null;
  generationStatus?: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
}

const GenerationSettingsForm: React.FC<GenerationSettingsFormProps> = ({
  title,
  level,
  setLevel,
  instructions,
  setInstructions,
  handleGenerate,
  handleCancel,
  generating,
  error,
  generationStatus = 'idle',
  progress = 0,
}) => {
  const getProgressValue = () => {
    if (generationStatus === 'completed') return 100;
    if (generationStatus === 'failed') return 0;
    
    // Use the provided progress or calculate based on status
    if (progress > 0) return progress;
    
    switch (generationStatus) {
      case 'pending': return 15;
      case 'processing': return 45;
      default: return 0;
    }
  };

  const getStatusMessage = () => {
    switch (generationStatus) {
      case 'pending': 
        return "Starting content generation...";
      case 'processing': 
        return "AI is generating your English lesson content. This typically takes 30-60 seconds...";
      case 'completed':
        return "Generation complete! Content ready for review.";
      case 'failed':
        return "Generation failed. Please try again.";
      default:
        return "Generate content to see status here.";
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h3 className="text-lg font-medium mb-2">English Lesson Title</h3>
        <p className="p-3 bg-muted rounded-md">{title || "Untitled English Lesson"}</p>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium mb-2">English Proficiency Level</h3>
        <div className="flex flex-wrap gap-2">
          {['beginner', 'intermediate', 'advanced'].map((l) => (
            <Button 
              key={l} 
              type="button"
              variant={level === l ? "default" : "outline"}
              onClick={() => setLevel(l as 'beginner' | 'intermediate' | 'advanced')}
              className="capitalize"
              disabled={generating}
            >
              {l}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium mb-2">Teaching Instructions (Optional)</h3>
        <div className="relative">
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Add specific instructions for the English lesson, e.g., 'Focus on business vocabulary' or 'Include pronunciation tips'"
            className="min-h-[120px] resize-y"
            disabled={generating}
          />
          <div className="text-xs text-muted-foreground mt-1">
            Provide any specific requirements or focus areas for this English lesson
          </div>
        </div>
      </div>
      
      {!generating ? (
        <Button 
          onClick={handleGenerate} 
          className="w-full"
          disabled={generating || !title}
        >
          <Sparkles className="mr-2 h-4 w-4" /> 
          Generate English Lesson Content
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button 
            className="w-full opacity-50" 
            disabled={true}
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Generating...
          </Button>
          
          {handleCancel && (
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              className="flex-shrink-0"
            >
              <StopCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      )}

      {generating && (
        <div className="p-4 border rounded-md bg-muted">
          <p className="text-sm text-center mb-2">{getStatusMessage()}</p>
          <Progress value={getProgressValue()} className="h-2 w-full" />
          <p className="text-xs text-center mt-2 text-muted-foreground">
            {Math.round(getProgressValue())}% - {generationStatus === 'processing' ? `Processing (attempt ${progress}/${100})` : generationStatus}
          </p>
        </div>
      )}

      <div className="p-4 border rounded-md bg-muted">
        <h4 className="font-medium mb-2 flex items-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          Tips for Good English Lessons
        </h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Be specific in your title (e.g., "Past Tense Verbs" instead of "Grammar")</li>
          <li>• Use instructions to specify focus areas (conversation, writing, reading)</li>
          <li>• Include contexts relevant to your students (business, travel, academics)</li>
          <li>• Consider including specific grammar points you want covered</li>
        </ul>
      </div>
    </div>
  );
};

export default GenerationSettingsForm;
