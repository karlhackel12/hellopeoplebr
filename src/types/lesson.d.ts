
export interface Lesson {
  id: string;
  created_at: string;
  title: string;
  content: string;
  teacher_id: string;
  is_published: boolean;
  structured_content?: any | null;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  last_accessed_at: string;
  completed_sections: string[];
}
