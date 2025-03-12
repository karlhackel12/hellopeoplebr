
import { extractSections } from "@/utils/markdownUtils";

interface ContentSegment {
  title: string;
  content: string;
  importance: number;
}

/**
 * Analyzes lesson content to extract key information for quiz generation
 */
export class QuizContentAnalyzer {
  /**
   * Extracts key concepts from the lesson content
   */
  static extractKeyConcepts(content: string): string[] {
    if (!content) return [];
    
    // Extract all bolded text as potential key concepts
    const boldRegex = /\*\*(.*?)\*\*/g;
    const boldMatches = [...content.matchAll(boldRegex)];
    const boldedConcepts = boldMatches.map(match => match[1].trim());
    
    // Filter out duplicates and short phrases
    return [...new Set(boldedConcepts)]
      .filter(concept => concept.length > 3 && concept.split(' ').length <= 5);
  }
  
  /**
   * Breaks down lesson content into content segments for more targeted quiz generation
   */
  static getContentSegments(content: string): ContentSegment[] {
    if (!content || content.length < 100) return [];
    
    const sections = extractSections(content);
    
    // If no sections, return the whole content as one segment
    if (sections.length === 0) {
      return [{
        title: 'Main Content',
        content: content,
        importance: 5
      }];
    }
    
    // Rate importance based on section length and position
    return sections.map((section, index) => {
      // Calculate importance: later sections usually contain more important content
      // and longer sections are typically more important
      const positionFactor = (index + 1) / sections.length;
      const lengthFactor = Math.min(section.content.length / 500, 1);
      const importance = Math.ceil((positionFactor * 0.7 + lengthFactor * 0.3) * 5);
      
      return {
        title: section.title,
        content: section.content,
        importance
      };
    });
  }
  
  /**
   * Prepares content for quiz generation by highlighting the most important parts
   */
  static prepareContentForQuizGeneration(content: string, numQuestions: number): string {
    if (!content) return '';
    
    const segments = this.getContentSegments(content);
    const concepts = this.extractKeyConcepts(content);
    
    // Early return for minimal content
    if (segments.length === 0) return content;
    
    // For small question sets, focus on the most important segments
    if (numQuestions <= 5 && segments.length > 3) {
      const importantSegments = [...segments]
        .sort((a, b) => b.importance - a.importance)
        .slice(0, Math.ceil(segments.length * 0.7));
      
      return importantSegments
        .map(segment => `## ${segment.title}\n${segment.content}`)
        .join('\n\n') + 
        (concepts.length > 0 ? `\n\nKey concepts: ${concepts.join(', ')}` : '');
    }
    
    // For larger question sets, include all content with hints
    return content + 
      (concepts.length > 0 ? `\n\nKey concepts: ${concepts.join(', ')}` : '');
  }
}
