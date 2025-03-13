
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAvailableLessons } from '../hooks/useAvailableLessons';

interface LessonSelectProps {
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string | null) => void;
}

const LessonSelect: React.FC<LessonSelectProps> = ({ selectedLessonId, onSelectLesson }) => {
  const { lessons, loading } = useAvailableLessons();

  return (
    <div className="space-y-2">
      <Label htmlFor="lesson-select">Choose Lesson (Optional)</Label>
      <Select
        value={selectedLessonId || "none"}
        onValueChange={(value) => onSelectLesson(value === "none" ? null : value)}
        disabled={loading}
      >
        <SelectTrigger id="lesson-select" className="w-full">
          <SelectValue placeholder="Select a lesson for quiz generation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No lesson (standalone quiz)</SelectItem>
          {lessons.map((lesson) => (
            <SelectItem key={lesson.id} value={lesson.id}>
              {lesson.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        {selectedLessonId 
          ? "AI will generate questions based on this lesson content" 
          : "Select a lesson to automatically generate quiz questions"}
      </p>
    </div>
  );
};

export default LessonSelect;
