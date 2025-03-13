
import { GeneratedLessonContent } from './types';

export const formatContent = (content: GeneratedLessonContent, title: string): string => {
  let formattedContent = `# ${title}\n\n`;
  
  formattedContent += `## Description\n${content.description}\n\n`;
  
  formattedContent += `## Learning Objectives\n`;
  content.objectives.forEach(objective => {
    formattedContent += `- ${objective}\n`;
  });
  formattedContent += '\n';
  
  formattedContent += `## Practical Situations\n`;
  content.practicalSituations.forEach(situation => {
    formattedContent += `- ${situation}\n`;
  });
  formattedContent += '\n';
  
  formattedContent += `## Key Phrases\n`;
  content.keyPhrases.forEach(phrase => {
    formattedContent += `- **${phrase.phrase}** - ${phrase.translation}\n  *Usage: ${phrase.usage}*\n`;
  });
  formattedContent += '\n';
  
  formattedContent += `## Vocabulary\n`;
  content.vocabulary.forEach(word => {
    formattedContent += `- **${word.word}** (${word.partOfSpeech}) - ${word.translation}\n`;
  });
  formattedContent += '\n';
  
  formattedContent += `## Explanations\n`;
  content.explanations.forEach(explanation => {
    formattedContent += `${explanation}\n\n`;
  });
  
  formattedContent += `## Tips\n`;
  content.tips.forEach(tip => {
    formattedContent += `- ${tip}\n`;
  });
  
  return formattedContent;
};
