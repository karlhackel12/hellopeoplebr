
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor, Bookmark, Book, BookOpen } from 'lucide-react';

interface LessonPreviewProps {
  content: string;
}

export const LessonPreview: React.FC<LessonPreviewProps> = ({ content }) => {
  const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');

  const formatMarkdownToHtml = (markdown: string): string => {
    // Simple markdown to HTML conversion
    let html = markdown
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold my-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold my-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gm, '<li class="ml-6 list-disc">$1</li>')
      .replace(/^([0-9]+)\. (.*$)/gm, '<li class="ml-6 list-decimal">$2</li>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-2 max-w-full rounded" />')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
      .replace(/\n\n/g, '<br/><br/>');
    
    // Preserve HTML tags for audio and video
    // We're making sure audio and video tags stay intact
    return html;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <BookOpen className="h-4 w-4 mr-2" />
          Student Preview
        </h3>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={viewMode === 'desktop' ? 'default' : 'outline'}
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="h-4 w-4 mr-1" /> Desktop
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'mobile' ? 'default' : 'outline'}
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone className="h-4 w-4 mr-1" /> Mobile
          </Button>
        </div>
      </div>

      <div className={`border rounded-lg overflow-hidden bg-white ${
        viewMode === 'mobile' ? 'max-w-[375px] mx-auto' : 'w-full'
      }`}>
        <div className="bg-primary text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold">Student Portal</h2>
            </div>
            <Button size="sm" variant="outline" className="bg-white/20 text-white border-white/20">
              <Bookmark className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <Tabs defaultValue="content">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="content">
                <Book className="h-4 w-4 mr-1" /> Lesson
              </TabsTrigger>
              <TabsTrigger value="practice">Exercises</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-0">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">Lesson Content</CardTitle>
                </CardHeader>
                <CardContent className="px-0 prose">
                  <div 
                    dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(content) }} 
                    className="media-content"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="practice" className="mt-0">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Practice exercises will be available after you save the lesson</p>
              </div>
            </TabsContent>
            
            <TabsContent value="quiz" className="mt-0">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Quiz will be available after you save the lesson</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>This is a preview of how your lesson will appear to students. Save the lesson to enable exercises and quiz features.</p>
      </div>
    </div>
  );
};
