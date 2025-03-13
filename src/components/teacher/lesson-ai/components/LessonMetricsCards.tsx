
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, FileText, MessageSquare } from 'lucide-react';
import { GeneratedLessonContent } from '../types';

interface LessonMetricsCardsProps {
  generatedContent: GeneratedLessonContent;
}

const LessonMetricsCards: React.FC<LessonMetricsCardsProps> = ({ generatedContent }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Book className="h-4 w-4 mr-2" />
            English Vocabulary
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
            Key English Phrases
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
            Lesson Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            {generatedContent.description.slice(0, 50)}...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonMetricsCards;
