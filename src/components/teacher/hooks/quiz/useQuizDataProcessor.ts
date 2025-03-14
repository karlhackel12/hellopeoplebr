
import { useCallback, useState } from "react";
import { QuizQuestionData } from "../../quiz/types/quizGeneration";
import { Question } from "../../quiz/types";

export const useQuizDataProcessor = () => {
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Process quiz questions from the API response
  const processQuizData = useCallback(async (
    questions: {
      question_text: string;
      question_type: 'multiple_choice' | 'true_false' | 'matching' | 'fill_in_blank' | 'audio_response';
      options: {
        option_text: string;
        is_correct: boolean;
      }[];
      points?: number;
    }[]
  ) => {
    try {
      // Map to QuizQuestionData format and ensure required fields
      const formattedQuestions: QuizQuestionData[] = questions.map(q => ({
        question_text: q.question_text,
        question_type: q.question_type,
        points: q.points || 1, // Default to 1 point if not specified
        options: q.options.map(o => ({
          option_text: o.option_text,
          is_correct: o.is_correct
        }))
      }));

      // Generate UUIDs for questions and options (in a real implementation)
      const questionsWithIds = formattedQuestions.map((question, qIndex) => {
        return {
          id: `temp-${qIndex}`,
          question_text: question.question_text,
          question_type: question.question_type,
          points: question.points,
          order_index: qIndex,
          options: question.options.map((option, oIndex) => ({
            id: `temp-${qIndex}-${oIndex}`,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: oIndex
          }))
        };
      });

      // Update the preview state
      setPreviewQuestions(questionsWithIds);
      setShowPreview(true);
      
      return questionsWithIds;
    } catch (error) {
      console.error("Error processing quiz data:", error);
      throw error;
    }
  }, []);

  return {
    processQuizData,
    previewQuestions,
    setPreviewQuestions,
    showPreview,
    setShowPreview
  };
};
