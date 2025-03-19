import { Lesson, VocabularyItem } from '@/types/lesson';

/**
 * Extrai a lista de termos de vocabulário de uma lição
 * 
 * @param lesson Objeto da lição
 * @returns Array de termos de vocabulário
 */
export function extractLessonVocabulary(lesson: Lesson): string[] {
  if (!lesson.content) return [];
  
  let vocabulary: string[] = [];
  
  // Verificar se há uma seção de vocabulário no conteúdo da lição
  if (lesson.content.vocabulary && Array.isArray(lesson.content.vocabulary)) {
    vocabulary = lesson.content.vocabulary.map((item: VocabularyItem | string) => {
      if (typeof item === 'string') return item;
      return item.term;
    });
  }
  
  // Verificar se há vocabulário no conteúdo estruturado legado
  const structuredContent = typeof lesson.content === 'string' 
    ? JSON.parse(lesson.content) 
    : lesson.content;
    
  if (structuredContent.vocabulary && Array.isArray(structuredContent.vocabulary)) {
    const vocabItems = structuredContent.vocabulary.map((item: any) => {
      if (typeof item === 'string') return item;
      return item.term || item.word || '';
    });
    
    vocabulary = [...vocabulary, ...vocabItems].filter(Boolean);
  }
  
  return Array.from(new Set(vocabulary)); // Remover duplicatas
}

/**
 * Extrai frases-chave de uma lição
 * 
 * @param lesson Objeto da lição
 * @returns Array de frases-chave
 */
export function extractLessonKeyPhrases(lesson: Lesson): string[] {
  if (!lesson.content) return [];
  
  let keyPhrases: string[] = [];
  
  // Tratando diferentes formatos de conteúdo
  const content = typeof lesson.content === 'string' 
    ? JSON.parse(lesson.content) 
    : lesson.content;
  
  // Verificar se há uma seção de frases-chave
  if (content.keyPhrases && Array.isArray(content.keyPhrases)) {
    keyPhrases = [...keyPhrases, ...content.keyPhrases];
  }
  
  // Verificar formato alternativo (key_phrases)
  if (content.key_phrases && Array.isArray(content.key_phrases)) {
    keyPhrases = [...keyPhrases, ...content.key_phrases];
  }
  
  // Verificar formato alternativo (expressions)
  if (content.expressions && Array.isArray(content.expressions)) {
    keyPhrases = [...keyPhrases, ...content.expressions];
  }
  
  return Array.from(new Set(keyPhrases)); // Remover duplicatas
}

/**
 * Extrai tópicos de uma lição
 * 
 * @param lesson Objeto da lição
 * @returns Array de tópicos
 */
export function extractLessonTopics(lesson: Lesson): string[] {
  if (!lesson.content) return [];
  
  let topics: string[] = [];
  
  // Tratando diferentes formatos de conteúdo
  const content = typeof lesson.content === 'string' 
    ? JSON.parse(lesson.content) 
    : lesson.content;
  
  // Verificar se há uma seção de tópicos
  if (content.topics && Array.isArray(content.topics)) {
    topics = [...topics, ...content.topics];
  }
  
  // Verificar formato alternativo (themes)
  if (content.themes && Array.isArray(content.themes)) {
    topics = [...topics, ...content.themes];
  }
  
  return Array.from(new Set(topics)); // Remover duplicatas
}

/**
 * Extrai pontos gramaticais de uma lição
 * 
 * @param lesson Objeto da lição
 * @returns Array de pontos gramaticais (apenas títulos)
 */
export function extractLessonGrammarPoints(lesson: Lesson): string[] {
  if (!lesson.content) return [];
  
  let grammarPoints: string[] = [];
  
  // Tratando diferentes formatos de conteúdo
  const content = typeof lesson.content === 'string' 
    ? JSON.parse(lesson.content) 
    : lesson.content;
  
  // Verificar se há uma seção de pontos gramaticais
  if (content.grammar_points && Array.isArray(content.grammar_points)) {
    grammarPoints = content.grammar_points.map((point: any) => {
      if (typeof point === 'string') return point;
      return point.title || '';
    }).filter(Boolean);
  }
  
  return Array.from(new Set(grammarPoints)); // Remover duplicatas
}

/**
 * Formata a dificuldade numérica como texto
 * 
 * @param level Nível de dificuldade (1-3)
 * @returns String representando o nível
 */
export function formatDifficultyLevel(level: number): string {
  const levels = ['Iniciante', 'Intermediário', 'Avançado'];
  return levels[Math.min(2, Math.max(0, level - 1))];
}

/**
 * Formata duração em segundos como texto legível
 * 
 * @param seconds Duração em segundos
 * @returns String formatada (ex: "5m 30s")
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return 'N/A';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
} 