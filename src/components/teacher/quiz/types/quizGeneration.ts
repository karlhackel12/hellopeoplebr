
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
}
