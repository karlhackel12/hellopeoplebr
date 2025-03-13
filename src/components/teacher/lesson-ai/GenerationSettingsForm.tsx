
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, StopCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import GenerationProgress from './components/GenerationProgress';
import { GenerationPhase } from './hooks/types';

interface GenerationSettingsFormProps {
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  setLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
  instructions: string;
  setInstructions: (instructions: string) => void;
  handleGenerate: () => Promise<void>;
  handleCancel?: () => void;
  handleRetry?: () => void;
  generating: boolean;
  error?: string | null;
  generationPhase: GenerationPhase;
  progressPercentage: number;
  statusMessage: string;
}

const GenerationSettingsForm: React.FC<GenerationSettingsFormProps> = ({
  title,
  level,
  setLevel,
  instructions,
  setInstructions,
  handleGenerate,
  handleCancel,
  handleRetry,
  generating,
  error,
  generationPhase,
  progressPercentage,
  statusMessage,
}) => {
  return (
    <div className="space-y-6">
      {generating && (
        <GenerationProgress
          phase={generationPhase}
          progress={progressPercentage}
          statusMessage={statusMessage}
          error={error}
          onCancel={handleCancel}
          onRetry={handleRetry}
        />
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
        generationPhase !== 'error' && (
          <Button 
            variant="destructive" 
            onClick={handleCancel}
            className="w-full"
          >
            <StopCircle className="mr-2 h-4 w-4" />
            Cancel Generation
          </Button>
        )
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
