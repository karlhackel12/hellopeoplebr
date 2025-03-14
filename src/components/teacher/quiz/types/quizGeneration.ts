
export interface QuizGenerationResponse {
  questions: {
    question_text: string;
    question_type: 'multiple_choice' | 'true_false' | 'matching' | 'fill_in_blank' | 'audio_response';
    options: {
      option_text: string;
      is_correct: boolean;
    }[];
    points?: number;
  }[];
  title?: string;
  pass_percent?: number;
  status?: 'succeeded' | 'failed_with_fallback';
  error?: string;
  processing_stats?: {
    content_length: number;
    prompt_length: number;
    processing_time_ms: number;
    total_time_ms: number;
  };
}

export interface QuizQuestionData {
  question_text: string;
  points: number;
  question_type: 'multiple_choice' | 'true_false' | 'matching' | 'fill_in_blank' | 'audio_response';
  options: QuizOptionData[];
}

export interface QuizOptionData {
  option_text: string;
  is_correct: boolean;
}

export interface QuizDetails {
  id: string;
  title: string;
  is_published: boolean;
  pass_percent: number;
  description?: string;
}

export type GenerationPhase = 
  | 'idle' 
  | 'loading' 
  | 'content-loading' 
  | 'analyzing' 
  | 'generating' 
  | 'saving' 
  | 'complete' 
  | 'error';

export interface QuizGenerationState {
  numQuestions: string;
  loadingError: string | null;
  errorDetails: string | null;
  isRetrying: boolean;
  contentLoadingMessage: string | null;
  currentPhase: GenerationPhase;
}
