
export interface GeneratedLessonContent {
  description: string;
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
}
