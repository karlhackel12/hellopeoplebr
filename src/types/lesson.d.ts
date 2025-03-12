
export type LessonType = {
  id: string;
  title: string;
  description: string;
  content: string;
}

export type LessonProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  last_accessed_at: string;
  completed_sections: string[];
}
