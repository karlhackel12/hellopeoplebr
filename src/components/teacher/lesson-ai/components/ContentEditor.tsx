
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { LessonFormValues } from '../../lesson-editor/useLessonForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GeneratedLessonContent } from '../types';
import { formatContent } from '../contentUtils';
import QuizTab from './QuizTab';
import { useQuizData } from '../../preview/useQuizData';

interface ContentEditorProps {
  form: UseFormReturn<LessonFormValues>;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ form }) => {
  const structuredContent = form.watch('structuredContent') as GeneratedLessonContent | null;
  const lessonId = form.watch('id');
  const { quizQuestions, quizTitle, loadingQuiz, quizExists } = useQuizData(lessonId);
  
  const handleContentChange = (field: keyof GeneratedLessonContent, value: any) => {
    if (!structuredContent) return;
    
    const updatedContent = {
      ...structuredContent,
      [field]: value
    };
    
    form.setValue('structuredContent', updatedContent);
    form.setValue('contentSource', 'mixed');
    
    // Update the markdown content based on the structured content
    const formattedContent = formatContent(updatedContent, form.watch('title'));
    form.setValue('content', formattedContent);
  };

  if (!structuredContent) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="structured" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="structured">Structured Editor</TabsTrigger>
          <TabsTrigger value="markdown">Markdown</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>
        
        <TabsContent value="structured" className="mt-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={structuredContent.description}
                  onChange={(e) => handleContentChange('description', e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Key Phrases</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={structuredContent.keyPhrases.map(phrase => 
                    `${phrase.phrase} | ${phrase.translation} | ${phrase.usage}`
                  ).join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(line => line.trim() !== '');
                    const phrases = lines.map(line => {
                      const [phrase = '', translation = '', usage = ''] = line.split('|').map(part => part.trim());
                      return { phrase, translation, usage };
                    });
                    handleContentChange('keyPhrases', phrases);
                  }}
                  className="min-h-[150px]"
                  placeholder="Format: Phrase | Translation | Usage"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Vocabulary</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={structuredContent.vocabulary.map(word => 
                    `${word.word} | ${word.translation} | ${word.partOfSpeech}`
                  ).join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(line => line.trim() !== '');
                    const words = lines.map(line => {
                      const [word = '', translation = '', partOfSpeech = ''] = line.split('|').map(part => part.trim());
                      return { word, translation, partOfSpeech };
                    });
                    handleContentChange('vocabulary', words);
                  }}
                  className="min-h-[150px]"
                  placeholder="Format: Word | Translation | Part of Speech"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="markdown" className="mt-4">
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
        </TabsContent>
        
        <TabsContent value="quiz" className="mt-4">
          {lessonId ? (
            <QuizTab 
              lessonId={lessonId} 
              loadingQuiz={loadingQuiz}
              quizExists={quizExists}
              quizQuestions={quizQuestions}
              quizTitle={quizTitle}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Quiz will be available after you save the lesson</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentEditor;
