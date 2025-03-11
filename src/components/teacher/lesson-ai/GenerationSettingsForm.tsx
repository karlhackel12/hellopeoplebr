
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface GenerationSettingsFormProps {
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  setLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
  instructions: string;
  setInstructions: (instructions: string) => void;
  handleGenerate: () => Promise<void>;
  generating: boolean;
}

const GenerationSettingsForm: React.FC<GenerationSettingsFormProps> = ({
  title,
  level,
  setLevel,
  instructions,
  setInstructions,
  handleGenerate,
  generating,
}) => {
  return (
    <div className="space-y-6">
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
          />
          <div className="text-xs text-muted-foreground mt-1">
            Provide any specific requirements or focus areas for this English lesson
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleGenerate} 
        className="w-full"
        disabled={generating || !title}
      >
        {generating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" /> 
            Generate English Lesson Content
          </>
        )}
      </Button>

      {generating && (
        <div className="p-4 border rounded-md bg-muted">
          <p className="text-sm text-center">Generating your English lesson content. This may take up to a minute...</p>
          <div className="mt-2 w-full bg-secondary rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full animate-pulse w-1/3"></div>
          </div>
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
