
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Question } from '../types';

export const useQuestionManager = (
  quizId: string | undefined,
  fetchQuizData: () => Promise<void>
) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const addQuestion = (questionCount: number) => {
    setCurrentQuestion({
      id: '',
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      order_index: questionCount,
      options: [
        { id: '', option_text: '', is_correct: true, order_index: 0 },
        { id: '', option_text: '', is_correct: false, order_index: 1 },
      ],
    });
    setAddingQuestion(true);
    setEditingQuestionId(null);
  };

  const editQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setEditingQuestionId(question.id);
    setAddingQuestion(true);
  };

  const cancelQuestionEdit = () => {
    setCurrentQuestion(null);
    setAddingQuestion(false);
    setEditingQuestionId(null);
  };

  const handleQuestionChange = (field: string, value: any) => {
    if (!currentQuestion) return;
    
    setCurrentQuestion({
      ...currentQuestion,
      [field]: value,
    });
  };

  const handleOptionChange = (index: number, field: string, value: any) => {
    if (!currentQuestion || !currentQuestion.options) return;
    
    const updatedOptions = [...currentQuestion.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value,
    };
    
    // If marking this option as correct in multiple choice, set others to false
    if (field === 'is_correct' && value === true && currentQuestion.question_type === 'multiple_choice') {
      updatedOptions.forEach((option, i) => {
        if (i !== index) {
          updatedOptions[i] = { ...option, is_correct: false };
        }
      });
    }
    
    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions,
    });
  };

  const addOption = () => {
    if (!currentQuestion || !currentQuestion.options) return;
    
    setCurrentQuestion({
      ...currentQuestion,
      options: [
        ...currentQuestion.options,
        {
          id: '',
          option_text: '',
          is_correct: false,
          order_index: currentQuestion.options.length,
        },
      ],
    });
  };

  const removeOption = (index: number) => {
    if (!currentQuestion || !currentQuestion.options) return;
    if (currentQuestion.options.length <= 2) {
      toast.error('Error', {
        description: 'A question must have at least 2 options',
      });
      return;
    }
    
    const updatedOptions = currentQuestion.options.filter((_, i) => i !== index)
      .map((option, i) => ({ ...option, order_index: i }));
    
    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions,
    });
  };

  const saveQuestion = async () => {
    if (!currentQuestion || !quizId) return;
    
    try {
      setSaving(true);
      
      if (editingQuestionId) {
        // Update existing question
        const { error: questionError } = await supabase
          .from('quiz_questions')
          .update({
            question_text: currentQuestion.question_text,
            question_type: currentQuestion.question_type,
            points: currentQuestion.points,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingQuestionId);
        
        if (questionError) throw questionError;
        
        // Handle options: delete existing options and add new ones
        if (currentQuestion.options && currentQuestion.options.length > 0) {
          // Delete existing options
          const { error: deleteError } = await supabase
            .from('quiz_question_options')
            .delete()
            .eq('question_id', editingQuestionId);
          
          if (deleteError) throw deleteError;
          
          // Add new options
          const optionsToInsert = currentQuestion.options.map((option, index) => ({
            question_id: editingQuestionId,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: index,
          }));
          
          const { error: insertError } = await supabase
            .from('quiz_question_options')
            .insert(optionsToInsert);
          
          if (insertError) throw insertError;
        }
        
        toast.success('Question updated', {
          description: 'Your question has been successfully updated',
        });
      } else {
        // Create new question
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: quizId,
            question_text: currentQuestion.question_text,
            question_type: currentQuestion.question_type,
            points: currentQuestion.points,
            order_index: currentQuestion.order_index,
          })
          .select();
        
        if (questionError) throw questionError;
        
        const newQuestionId = questionData[0].id;
        
        // Add options
        if (currentQuestion.options && currentQuestion.options.length > 0) {
          const optionsToInsert = currentQuestion.options.map((option, index) => ({
            question_id: newQuestionId,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: index,
          }));
          
          const { error: insertError } = await supabase
            .from('quiz_question_options')
            .insert(optionsToInsert);
          
          if (insertError) throw insertError;
        }
        
        toast.success('Question added', {
          description: 'Your question has been successfully added to the quiz',
        });
      }
      
      // Reset and reload data
      setCurrentQuestion(null);
      setAddingQuestion(false);
      setEditingQuestionId(null);
      await fetchQuizData();
      
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Error', {
        description: 'Failed to save question',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    const confirm = window.confirm('Are you sure you want to delete this question? This action cannot be undone.');
    
    if (confirm) {
      try {
        // Delete options first (as they reference the question)
        const { error: optionsError } = await supabase
          .from('quiz_question_options')
          .delete()
          .eq('question_id', questionId);
        
        if (optionsError) throw optionsError;
        
        // Then delete the question
        const { error: questionError } = await supabase
          .from('quiz_questions')
          .delete()
          .eq('id', questionId);
        
        if (questionError) throw questionError;
        
        toast.success('Question deleted', {
          description: 'The question has been successfully deleted',
        });
        
        await fetchQuizData();
      } catch (error) {
        console.error('Error deleting question:', error);
        toast.error('Error', {
          description: 'Failed to delete question',
        });
      }
    }
  };

  return {
    currentQuestion,
    addingQuestion,
    editingQuestionId,
    saving,
    addQuestion,
    editQuestion,
    cancelQuestionEdit,
    handleQuestionChange,
    handleOptionChange,
    addOption,
    removeOption,
    saveQuestion,
    deleteQuestion,
  };
};
