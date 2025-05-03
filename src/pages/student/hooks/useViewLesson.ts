import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useViewLesson = () => {
  // Adicione este estado para controlar o modo de visualização
  const [viewMode, setViewMode] = useState<'standard' | 'duolingo'>('standard');
  
  // Adicione função para converter questões do quiz para o formato Duolingo
  const convertQuizQuestionsToDuolingoFormat = (quizQuestions: any[]) => {
    return quizQuestions.map(q => ({
      id: q.id,
      type: 'multiple_choice', // Mapear tipos de questão se necessário
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer
    }));
  };
  
  // Adicione função para verificar se o formato Duolingo deve ser usado
  const shouldUseDuolingoStyle = () => {
    // Verificar se o usuário tem configuração para usar estilo Duolingo
    // ou se a lição específica está marcada para usar este estilo
    return true; // Por padrão, ative para todas as lições
  };
  
  // Use efeito para determinar o modo de visualização ao carregar a lição
  useEffect(() => {
    if (shouldUseDuolingoStyle()) {
      setViewMode('duolingo');
    }
  }, [/* dependências apropriadas como lesson, quiz, etc */]);
  
  // Retorne as novas propriedades junto com as propriedades existentes do hook
  return {
    // Propriedades existentes do hook
    // ...
    
    // Novas propriedades
    viewMode,
    setViewMode,
    duolingoQuizQuestions: [], // Implemente a conversão real aqui
    convertQuizQuestionsToDuolingoFormat,
  };
}; 