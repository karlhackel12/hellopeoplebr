
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book, MessageCircle, Bookmark } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface ConversationHeaderProps {
  practiceTopic: string;
  lesson?: any;
  difficultyLevel: number;
  setDifficultyLevel: (level: number) => void;
  vocabularyItems?: string[];
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  practiceTopic,
  lesson,
  difficultyLevel,
  setDifficultyLevel,
  vocabularyItems = []
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-blue-500" />
            <CardTitle className="text-2xl">{practiceTopic}</CardTitle>
          </div>
          {lesson && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1">
              <Book className="h-3 w-3" />
              Lesson Practice
            </Badge>
          )}
        </div>
        <CardDescription>
          {lesson
            ? `Practice your speaking skills based on the lesson: "${lesson.title}"`
            : "Practice your conversational English skills with an AI partner"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Difficulty Level</span>
            <Select 
              value={String(difficultyLevel)} 
              onValueChange={(value) => setDifficultyLevel(Number(value))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="1">Beginner</SelectItem>
                  <SelectItem value="2">Intermediate</SelectItem>
                  <SelectItem value="3">Advanced</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {vocabularyItems && vocabularyItems.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium flex items-center gap-1">
                <Bookmark className="h-3 w-3" /> 
                Target Vocabulary
              </span>
              <div className="flex flex-wrap gap-1 max-w-md">
                {vocabularyItems.slice(0, 5).map((word, i) => (
                  <Badge key={i} variant="outline" className="bg-slate-50">
                    {word}
                  </Badge>
                ))}
                {vocabularyItems.length > 5 && (
                  <Badge variant="outline">+{vocabularyItems.length - 5} more</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationHeader;
