
import { useState } from 'react';
import { toast } from 'sonner';

export const useSmartQuizGeneration = (
  generateQuiz: (numQuestions: number, optimizedContent?: string) => Promise<boolean>,
  getLessonContent: () => Promise<string | null>
) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  /**
   * Optimizes lesson content by removing unnecessary elements and focusing on key concepts
   */
  const optimizeLessonContent = (content: string): string => {
    if (!content) return '';
    
    // Basic content optimization
    const trimmedContent = content
      .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple line breaks
      .trim();
    
    // Identify key sections (headers, bold text, etc.)
    const sections = trimmedContent.split(/#{1,3}\s/);
    
    // If content is already optimal size, return as-is
    if (trimmedContent.length < 15000) {
      return trimmedContent;
    }
    
    // For longer content, extract the most relevant parts
    let optimizedContent = '';
    
    // Add introduction (first 1000 chars)
    optimizedContent += trimmedContent.slice(0, 1000) + '\n\n';
    
    // Extract sections with keywords like "concept", "key", "important"
    const keywordRegex = /\b(concept|key|important|essential|fundamental|critical|main|primary)\b/i;
    for (const section of sections) {
      if (keywordRegex.test(section)) {
        optimizedContent += section + '\n\n';
      }
    }
    
    // Add bolded text as it often contains key concepts
    const boldRegex = /\*\*(.*?)\*\*/g;
    const boldMatches = [...trimmedContent.matchAll(boldRegex)];
    if (boldMatches.length > 0) {
      optimizedContent += "Key concepts:\n";
      for (const match of boldMatches) {
        optimizedContent += `- ${match[1]}\n`;
      }
    }
    
    // Ensure we don't exceed a reasonable size
    if (optimizedContent.length > 12000) {
      return optimizedContent.slice(0, 12000) + '\n\n[Content truncated for optimization]';
    }
    
    return optimizedContent || trimmedContent;
  };

  /**
   * Generates a quiz with optimized content processing
   */
  const generateSmartQuiz = async (numQuestions: string): Promise<boolean> => {
    try {
      setIsOptimizing(true);
      
      // Get the lesson content
      const content = await getLessonContent();
      
      if (!content || content.length < 100) {
        toast.error('Insufficient content', {
          description: 'The lesson needs more content before generating a quiz',
        });
        return false;
      }
      
      // Analyze content length and complexity
      const contentLength = content.length;
      const complexityFactor = Math.min(parseInt(numQuestions), 10) / 5;
      
      console.log(`Content length: ${contentLength}, Complexity factor: ${complexityFactor}`);
      
      // For very long content, optimize before sending to generation
      let processedContent = content;
      if (contentLength > 10000) {
        console.log('Content exceeds 10K chars, optimizing...');
        processedContent = optimizeLessonContent(content);
        console.log(`Optimized content length: ${processedContent.length}`);
      }
      
      // Generate the quiz with optimized content
      const success = await generateQuiz(parseInt(numQuestions), processedContent);
      
      if (!success) {
        console.error('Failed to generate quiz with optimized content');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in generateSmartQuiz:', error);
      return false;
    } finally {
      setIsOptimizing(false);
    }
  };

  return {
    generateSmartQuiz,
    isOptimizing
  };
};
