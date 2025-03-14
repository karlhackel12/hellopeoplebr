
import { GeneratedLessonContent } from './types';

/**
 * Format generated lesson content into markdown format for display
 */
export const formatContent = (content: GeneratedLessonContent, title: string): string => {
  if (!content) return '';
  
  let markdown = `# ${title || 'English Lesson'}\n\n`;
  
  // Add description
  if (content.description) {
    markdown += `## Overview\n\n${content.description}\n\n`;
  }
  
  // Add objectives
  if (content.objectives && content.objectives.length > 0) {
    markdown += `## Learning Objectives\n\n`;
    content.objectives.forEach(objective => {
      markdown += `- ${objective}\n`;
    });
    markdown += '\n';
  }
  
  // Add key phrases
  if (content.keyPhrases && content.keyPhrases.length > 0) {
    markdown += `## Key Phrases\n\n`;
    content.keyPhrases.forEach(phrase => {
      markdown += `### ${phrase.phrase}\n\n`;
      markdown += `**Translation:** ${phrase.translation}\n\n`;
      markdown += `**Usage:** ${phrase.usage}\n\n`;
    });
  }
  
  // Add vocabulary
  if (content.vocabulary && content.vocabulary.length > 0) {
    markdown += `## Vocabulary\n\n`;
    markdown += `| Word | Part of Speech | Translation | Example |\n`;
    markdown += `| ---- | -------------- | ----------- | ------- |\n`;
    content.vocabulary.forEach(item => {
      markdown += `| **${item.word}** | ${item.partOfSpeech} | ${item.translation} | ${item.example || '-'} |\n`;
    });
    markdown += '\n';
  }
  
  // Add practical situations
  if (content.practicalSituations && content.practicalSituations.length > 0) {
    markdown += `## Practical Situations\n\n`;
    content.practicalSituations.forEach((situation, index) => {
      markdown += `### Situation ${index + 1}: ${situation.situation}\n\n`;
      markdown += `${situation.example}\n\n`;
    });
  }
  
  // Add explanations
  if (content.explanations && content.explanations.length > 0) {
    markdown += `## Grammar & Concept Explanations\n\n`;
    content.explanations.forEach(explanation => {
      markdown += `### ${explanation.concept}\n\n`;
      markdown += `${explanation.explanation}\n\n`;
    });
  }
  
  // Add tips
  if (content.tips && content.tips.length > 0) {
    markdown += `## Learning Tips\n\n`;
    content.tips.forEach(tip => {
      markdown += `- **Tip:** ${tip.tip}`;
      if (tip.context) {
        markdown += ` (${tip.context})`;
      }
      markdown += `\n`;
    });
    markdown += '\n';
  }
  
  return markdown;
};

/**
 * Count content elements to provide metrics
 */
export const countContentElements = (content: GeneratedLessonContent) => {
  if (!content) return {
    phrases: 0,
    vocabulary: 0,
    situations: 0,
    explanations: 0,
    tips: 0
  };
  
  return {
    phrases: content.keyPhrases?.length || 0,
    vocabulary: content.vocabulary?.length || 0,
    situations: content.practicalSituations?.length || 0,
    explanations: content.explanations?.length || 0,
    tips: content.tips?.length || 0
  };
};
