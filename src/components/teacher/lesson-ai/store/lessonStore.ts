
import { create } from 'zustand';
import { GeneratedLessonContent } from '../types';

interface LessonSection {
  title: string;
  content: string;
  type?: string;
}

interface LessonMetadata {
  grade?: string;
  subject?: string;
  estimatedTime?: string;
  objectives?: string[];
  keywords?: string[];
  [key: string]: any;
}

export interface LessonContent {
  sections?: LessonSection[];
  metadata?: LessonMetadata;
  [key: string]: any; // This allows extra properties to accommodate GeneratedLessonContent
}

interface LessonStore {
  lessonContent: LessonContent | null;
  updateContent: (content: LessonContent | GeneratedLessonContent) => void;
  updateMetadata: (metadata: Partial<LessonMetadata>) => void;
  reset: () => void;
}

export const useLessonStore = create<LessonStore>((set) => ({
  lessonContent: null,
  updateContent: (content) => set({ lessonContent: content }),
  updateMetadata: (metadata) =>
    set((state) => ({
      lessonContent: state.lessonContent
        ? {
            ...state.lessonContent,
            metadata: { ...state.lessonContent.metadata, ...metadata },
          }
        : null,
    })),
  reset: () => set({ lessonContent: null }),
}));
