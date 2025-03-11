
export type Quiz = {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  pass_percent: number;
};

export type QuestionOption = {
  id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
};

export type Question = {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'matching' | 'fill_in_blank' | 'audio_response';
  points: number;
  order_index: number;
  options?: QuestionOption[];
};
