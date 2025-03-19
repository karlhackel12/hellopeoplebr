export interface Lesson {
  id: string;
  title: string;
  description?: string;
  content: LessonContent;
  created_at?: string;
  updated_at?: string;
  author_id?: string;
  is_published?: boolean;
  level?: number;
  order?: number;
  category_id?: string;
  category?: {
    id: string;
    name: string;
  };
  tags?: string[];
}

export interface LessonContent {
  sections: LessonSection[];
  vocabulary?: VocabularyItem[];
  keyPhrases?: string[];
  topics?: string[];
  summary?: string;
  grammar_points?: GrammarPoint[];
  exercises?: Exercise[];
  media?: MediaItem[];
}

export interface LessonSection {
  title: string;
  content: string;
  type: 'text' | 'video' | 'audio' | 'quiz' | 'exercise';
  mediaUrl?: string;
}

export interface VocabularyItem {
  term: string;
  definition: string;
  example?: string;
  image_url?: string;
}

export interface GrammarPoint {
  title: string;
  explanation: string;
  examples: string[];
}

export interface Exercise {
  id: string;
  title: string;
  instructions: string;
  type: 'multiple_choice' | 'fill_in_blank' | 'matching' | 'writing' | 'speaking';
  questions: ExerciseQuestion[];
}

export interface ExerciseQuestion {
  id: string;
  text: string;
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'audio' | 'video';
  url: string;
  title?: string;
  description?: string;
}

export interface AssignedLesson {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  lesson_id: string;
  lesson: Lesson;
}

export interface LessonProgress {
  id: string;
  lesson_id: string;
  user_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  last_accessed_at: string;
  completed_at?: string;
  practice_completed?: boolean;
}
