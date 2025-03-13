
import { GeneratedLessonContent } from './types';

export const formatContent = (content: GeneratedLessonContent, title: string): string => {
  let formattedContent = `# ${title}\n\n`;
  
  formattedContent += `## Description\n${content.description}\n\n`;
  
  formattedContent += `## Key Phrases\n`;
  content.keyPhrases.forEach(phrase => {
    formattedContent += `- **${phrase.phrase}** - ${phrase.translation}\n  *Usage: ${phrase.usage}*\n`;
  });
  formattedContent += '\n';
  
  formattedContent += `## Vocabulary\n`;
  content.vocabulary.forEach(word => {
    formattedContent += `- **${word.word}** (${word.partOfSpeech}) - ${word.translation}\n`;
  });
  
  return formattedContent;
};
