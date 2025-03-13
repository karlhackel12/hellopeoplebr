
export interface GeneratedLessonContent {
  description: string;
  objectives: string[];
  practicalSituations: string[];
  keyPhrases: Array<{
    phrase: string;
    translation: string;
    usage: string;
  }>;
  vocabulary: Array<{
    word: string;
    translation: string;
    partOfSpeech: string;
  }>;
  explanations: string[];
  tips: string[];
}
