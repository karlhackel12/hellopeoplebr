
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from './LessonEditor';
import { Button } from '@/components/ui/button';
import { Sparkles, Save, Edit, Check, Loader2, Book, FileText, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LessonPreview } from './LessonPreview';

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

interface AILessonFormProps {
  form: UseFormReturn<LessonFormValues>;
  title: string;
}

const AILessonForm: React.FC<AILessonFormProps> = ({ form, title }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'preview' | 'edit'>('generate');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedLessonContent | null>(null);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [pollInterval, setPollInterval] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [instructions, setInstructions] = useState('');

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
      
      const generationParams = {
        timestamp: new Date().toISOString(),
        title,
        level,
        language: 'english',
        instructions: instructions.trim() || undefined,
      };
      
      const response = await supabase.functions.invoke('generate-lesson-content', {
        body: {
          title,
          level,
          language: 'english',
          instructions: instructions.trim() || undefined,
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      const predictionData = response.data;
      
      if (!predictionData?.id) {
        throw new Error("Failed to start content generation");
      }
      
      startPolling(predictionData.id, generationParams);
      
    } catch (error) {
      console.error("Error generating lesson content:", error);
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "Failed to generate lesson content",
      });
      setGenerating(false);
    }
  };
  
  const startPolling = (predictionId: string, generationParams: any) => {
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
          
          try {
            let output = prediction.output;
            
            const jsonStart = output.indexOf('{');
            const jsonEnd = output.lastIndexOf('}') + 1;
            
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
              output = output.substring(jsonStart, jsonEnd);
            }
            
            const parsedContent = JSON.parse(output) as GeneratedLessonContent;
            setGeneratedContent(parsedContent);
            
            const metadata = {
              ...generationParams,
              model: prediction.model,
              predictionId: predictionId,
              completed: prediction.completed_at,
              status: prediction.status
            };
            
            const formattedContent = formatContent(parsedContent);
            form.setValue('content', formattedContent);
            form.setValue('contentSource', 'ai_generated');
            form.setValue('structuredContent', parsedContent);
            form.setValue('generationMetadata', metadata);
            
            setActiveTab('preview');
            
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
        
        if (prediction.status === "starting" || prediction.status === "processing") {
          // For 'starting' or 'processing' statuses, we continue polling
        }
        
      } catch (error) {
        clearInterval(interval);
        setPollInterval(null);
        console.error("Error checking prediction status:", error);
        toast.error("Generation failed", {
          description: error instanceof Error ? error.message : "Failed to check generation status",
        });
        setGenerating(false);
      }
    }, 2000);
    
    setPollInterval(interval as unknown as number);
  };
  
  const formatContent = (content: GeneratedLessonContent): string => {
    let formattedContent = `# ${title}\n\n`;
    
    formattedContent += `## Description\n${content.description}\n\n`;
    
    formattedContent += `## Learning Objectives\n`;
    content.objectives.forEach(objective => {
      formattedContent += `- ${objective}\n`;
    });
    formattedContent += '\n';
    
    formattedContent += `## Practical Situations\n`;
    content.practicalSituations.forEach(situation => {
      formattedContent += `- ${situation}\n`;
    });
    formattedContent += '\n';
    
    formattedContent += `## Key Phrases\n`;
    content.keyPhrases.forEach(phrase => {
      formattedContent += `- **${phrase.phrase}** - ${phrase.translation}\n  *Usage: ${phrase.usage}*\n`;
    });
    formattedContent += '\n';
    
    formattedContent += `## Vocabulary\n`;
    content.vocabulary.forEach(word => {
      formattedContent += `- **${word.word}** (${word.partOfSpeech}) - ${word.translation}\n`;
    });
    formattedContent += '\n';
    
    formattedContent += `## Explanations\n`;
    content.explanations.forEach(explanation => {
      formattedContent += `${explanation}\n\n`;
    });
    
    formattedContent += `## Tips\n`;
    content.tips.forEach(tip => {
      formattedContent += `- ${tip}\n`;
    });
    
    return formattedContent;
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      form.setValue('contentSource', 'mixed');
    }
  };

  const renderGenerationForm = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Lesson Title</h3>
          <p className="p-3 bg-muted rounded-md">{title || "Untitled Lesson"}</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium mb-2">Proficiency Level</h3>
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
          <h3 className="text-lg font-medium mb-2">Instructions (Optional)</h3>
          <div className="relative">
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Add specific instructions for the AI, e.g., 'Focus on conversational phrases' or 'Include cultural context'"
              className="min-h-[120px] resize-y"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Provide any specific requirements or focus areas for this lesson
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
              Generate Lesson Content
            </>
          )}
        </Button>

        {generating && (
          <div className="p-4 border rounded-md bg-muted">
            <p className="text-sm text-center">Generating your lesson content. This may take up to a minute...</p>
            <div className="mt-2 w-full bg-secondary rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full animate-pulse w-1/3"></div>
            </div>
          </div>
        )}

        <div className="p-4 border rounded-md bg-muted">
          <h4 className="font-medium mb-2 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Tips for Good Results
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Be specific in your title (e.g., "Past Tense Verbs in Spanish" instead of "Spanish Grammar")</li>
            <li>• Use the instructions field to specify teaching approach or content focus</li>
            <li>• Include any cultural contexts or specific examples you want covered</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    if (!generatedContent) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="px-2 py-1">
            AI Generated {form.watch('contentSource') === 'mixed' && '(Edited)'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleEditMode}
          >
            {editMode ? (
              <>
                <Check className="mr-1 h-4 w-4" /> Done Editing
              </>
            ) : (
              <>
                <Edit className="mr-1 h-4 w-4" /> Edit Content
              </>
            )}
          </Button>
        </div>
        
        {editMode ? (
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    className="min-h-[400px] font-mono"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="border rounded-md p-4 max-h-[500px] overflow-y-auto">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: form.watch('content').replace(/\n/g, '<br/>') }} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Book className="h-4 w-4 mr-2" />
                Vocabulary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                {generatedContent.vocabulary.length} words included
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Key Phrases
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                {generatedContent.keyPhrases.length} phrases included
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Contents
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                {generatedContent.objectives.length} objectives, {generatedContent.explanations.length} explanations
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="generate" disabled={generating}>Generation Settings</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedContent}>Content Preview</TabsTrigger>
          <TabsTrigger value="edit" disabled={!generatedContent}>Student View</TabsTrigger>
        </TabsList>
        <TabsContent value="generate" className="pt-4">
          {renderGenerationForm()}
        </TabsContent>
        <TabsContent value="preview" className="pt-4">
          {renderPreview()}
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
