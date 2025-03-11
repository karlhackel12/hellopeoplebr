
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UseFormSetValue } from 'react-hook-form';
import { LessonFormValues } from './LessonEditor';

interface AILessonGeneratorProps {
  title: string;
  setValue: UseFormSetValue<LessonFormValues>;
  onContentGenerated?: (content: string) => void;
}

// Define the structure of our AI-generated content
interface GeneratedLessonContent {
  description: string;
  objectives: string[];
  practicalSituations: string[];
  keyPhrases: Array<{
    phrase: string;
    translation: string;
    usage: string;
  }>;
  vocabulary: Array<{
    word: string;
    translation: string;
    partOfSpeech: string;
  }>;
  explanations: string[];
  tips: string[];
}

const AILessonGenerator: React.FC<AILessonGeneratorProps> = ({
  title,
  setValue,
  onContentGenerated,
}) => {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [generatedContent, setGeneratedContent] = useState<GeneratedLessonContent | null>(null);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [pollInterval, setPollInterval] = useState<number | null>(null);
  
  const handleGenerate = async () => {
    try {
      setGenerating(true);
      
      if (!title.trim()) {
        toast.error("Title required", {
          description: "Please provide a lesson title before generating content",
        });
        setGenerating(false);
        return;
      }
      
      const response = await supabase.functions.invoke('generate-lesson-content', {
        body: {
          title,
          level,
          language: 'english', // Could be made dynamic in the future
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      const predictionData = response.data;
      
      if (!predictionData?.id) {
        throw new Error("Failed to start content generation");
      }
      
      // Start polling for results
      startPolling(predictionData.id);
      
    } catch (error) {
      console.error("Error generating lesson content:", error);
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "Failed to generate lesson content",
      });
      setGenerating(false);
    }
  };
  
  const startPolling = (predictionId: string) => {
    // Clear any existing polling interval
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            "Authorization": `Token ${import.meta.env.VITE_REPLICATE_API_KEY || ''}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to check prediction status");
        }
        
        const prediction = await response.json();
        
        if (prediction.status === "succeeded") {
          clearInterval(interval);
          setPollInterval(null);
          
          // Process the output
          try {
            // The output from this model is a string, try to parse it as JSON
            let output = prediction.output;
            
            // Sometimes the model might return a string with extra characters
            // Try to find and extract just the JSON part
            const jsonStart = output.indexOf('{');
            const jsonEnd = output.lastIndexOf('}') + 1;
            
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
              output = output.substring(jsonStart, jsonEnd);
            }
            
            const parsedContent = JSON.parse(output) as GeneratedLessonContent;
            setGeneratedContent(parsedContent);
            
            // Toast notification for success
            toast.success("Content generated", {
              description: "AI-generated content is ready for review",
            });
          } catch (parseError) {
            console.error("Error parsing AI response:", parseError, prediction.output);
            toast.error("Processing error", {
              description: "Failed to process the generated content",
            });
          }
          
          setGenerating(false);
        } else if (prediction.status === "failed") {
          clearInterval(interval);
          setPollInterval(null);
          throw new Error(prediction.error || "Generation failed");
        }
        
        // For 'starting' or 'processing' statuses, we continue polling
        
      } catch (error) {
        clearInterval(interval);
        setPollInterval(null);
        console.error("Error checking prediction status:", error);
        toast.error("Generation failed", {
          description: error instanceof Error ? error.message : "Failed to check generation status",
        });
        setGenerating(false);
      }
    }, 2000); // Check every 2 seconds
    
    setPollInterval(interval as unknown as number);
  };
  
  const formatContent = (content: GeneratedLessonContent): string => {
    let formattedContent = `# ${title}\n\n`;
    
    // Description
    formattedContent += `## Description\n${content.description}\n\n`;
    
    // Objectives
    formattedContent += `## Learning Objectives\n`;
    content.objectives.forEach(objective => {
      formattedContent += `- ${objective}\n`;
    });
    formattedContent += '\n';
    
    // Practical Situations
    formattedContent += `## Practical Situations\n`;
    content.practicalSituations.forEach(situation => {
      formattedContent += `- ${situation}\n`;
    });
    formattedContent += '\n';
    
    // Key Phrases
    formattedContent += `## Key Phrases\n`;
    content.keyPhrases.forEach(phrase => {
      formattedContent += `- **${phrase.phrase}** - ${phrase.translation}\n  *Usage: ${phrase.usage}*\n`;
    });
    formattedContent += '\n';
    
    // Vocabulary
    formattedContent += `## Vocabulary\n`;
    content.vocabulary.forEach(word => {
      formattedContent += `- **${word.word}** (${word.partOfSpeech}) - ${word.translation}\n`;
    });
    formattedContent += '\n';
    
    // Explanations
    formattedContent += `## Explanations\n`;
    content.explanations.forEach(explanation => {
      formattedContent += `${explanation}\n\n`;
    });
    
    // Tips
    formattedContent += `## Tips\n`;
    content.tips.forEach(tip => {
      formattedContent += `- ${tip}\n`;
    });
    
    return formattedContent;
  };
  
  const handleApply = () => {
    if (generatedContent) {
      const formattedContent = formatContent(generatedContent);
      setValue('content', formattedContent);
      if (onContentGenerated) {
        onContentGenerated(formattedContent);
      }
      setOpen(false);
      toast.success("Content applied", {
        description: "AI-generated content has been added to your lesson",
      });
    }
  };
  
  const renderPreview = () => {
    if (!generatedContent) return null;
    
    return (
      <div className="mt-4 space-y-6 max-h-[60vh] overflow-y-auto p-4 border rounded-md">
        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p>{generatedContent.description}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Learning Objectives</h3>
          <ul className="list-disc pl-5 space-y-1">
            {generatedContent.objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Practical Situations</h3>
          <ul className="list-disc pl-5 space-y-1">
            {generatedContent.practicalSituations.map((situation, index) => (
              <li key={index}>{situation}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Key Phrases</h3>
          <div className="space-y-3">
            {generatedContent.keyPhrases.map((phrase, index) => (
              <div key={index} className="border-l-2 border-primary pl-3">
                <p className="font-medium">{phrase.phrase} - {phrase.translation}</p>
                <p className="text-sm text-muted-foreground">Usage: {phrase.usage}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Vocabulary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {generatedContent.vocabulary.map((word, index) => (
              <div key={index} className="border rounded-md p-2">
                <p className="font-medium">{word.word}</p>
                <p className="text-sm">{word.translation} <span className="text-muted-foreground italic">({word.partOfSpeech})</span></p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Explanations</h3>
          <div className="space-y-3">
            {generatedContent.explanations.map((explanation, index) => (
              <p key={index}>{explanation}</p>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Tips</h3>
          <ul className="list-disc pl-5 space-y-1">
            {generatedContent.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
  
  const renderRaw = () => {
    if (!generatedContent) return null;
    
    const formattedContent = formatContent(generatedContent);
    
    return (
      <div className="mt-4 max-h-[60vh] overflow-y-auto">
        <pre className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
          {formattedContent}
        </pre>
      </div>
    );
  };
  
  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="h-4 w-4" />
        Generate with AI
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Generate Lesson Content with AI</DialogTitle>
            <DialogDescription>
              Use AI to generate content for your lesson. You can review and edit the generated content before applying it.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {!generating && !generatedContent ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Lesson title:</p>
                  <p className="px-3 py-2 border rounded-md">{title || "Untitled Lesson"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Proficiency level:</p>
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
              </div>
            ) : generating ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-lg font-medium">Generating lesson content...</p>
                <p className="text-sm text-muted-foreground mt-2">This may take a minute or two.</p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="raw">Raw Content</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  {renderPreview()}
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                  {renderRaw()}
                </TabsContent>
              </Tabs>
            )}
          </div>
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={generating}
            >
              Cancel
            </Button>
            {!generating && !generatedContent ? (
              <Button type="button" onClick={handleGenerate}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </Button>
            ) : generatedContent ? (
              <Button type="button" onClick={handleApply}>
                Apply to Lesson
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AILessonGenerator;
