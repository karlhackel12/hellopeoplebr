
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LessonPreviewProps {
  lesson: {
    description: string;
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
  };
  title: string;
}

const LessonPreview: React.FC<LessonPreviewProps> = ({ lesson, title }) => {
  if (!lesson) {
    return <div>No lesson content to display</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2">{lesson.description}</p>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-3">Key Phrases</h2>
        <div className="grid gap-3">
          {lesson.keyPhrases.map((item, index) => (
            <Card key={`phrase-${index}`} className="bg-muted/40">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div className="font-medium text-lg">{item.phrase}</div>
                    <div className="text-sm text-muted-foreground italic">{item.translation}</div>
                  </div>
                  <div className="text-sm mt-2">
                    <span className="text-muted-foreground">Usage: </span>{item.usage}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-3">Vocabulary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lesson.vocabulary.map((item, index) => (
            <Card key={`vocab-${index}`} className="bg-muted/40">
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{item.word}</div>
                    <div className="text-xs text-muted-foreground">{item.partOfSpeech}</div>
                  </div>
                  <div className="text-sm italic">{item.translation}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LessonPreview;
