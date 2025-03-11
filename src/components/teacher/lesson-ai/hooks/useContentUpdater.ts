
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../../lesson-editor/useLessonForm';
import { GeneratedLessonContent } from '../types';
import { GenerationParams } from './types';
import { formatContent } from '../contentUtils';

export const useContentUpdater = (form: UseFormReturn<LessonFormValues>) => {
  const updateFormContent = (
    parsedContent: GeneratedLessonContent, 
    title: string,
    generationParams: GenerationParams
  ) => {
    const metadata = {
      ...generationParams,
      model: "deepseek-r1",
      completed: new Date().toISOString(),
      status: 'succeeded'
    };
    
    const formattedContent = formatContent(parsedContent, title);
    
    form.setValue('content', formattedContent);
    form.setValue('contentSource', 'ai_generated');
    form.setValue('structuredContent', parsedContent);
    form.setValue('generationMetadata', metadata);
    
    return formattedContent;
  };

  return {
    updateFormContent
  };
};
