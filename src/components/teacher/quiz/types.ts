
export interface QuestionOption {
  id: string;
  option_text: string;
  is_correct: boolean;
  order_index?: number;
}

export interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'matching' | 'fill_in_blank' | 'audio_response';
  options: QuestionOption[];
  points?: number;
  media_url?: string;
  order_index?: number;
}
