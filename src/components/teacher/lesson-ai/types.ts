
export interface KeyPhrase {
  phrase: string;
  translation: string;
  usage: string;
}

export interface VocabularyItem {
  word: string;
  translation: string;
  partOfSpeech: string;
  example?: string;
}

export interface PracticalSituation {
  situation: string;
  example: string;
}

export interface Explanation {
  concept: string;
  explanation: string;
}

export interface LearningTip {
  tip: string;
  context?: string;
}

export interface GeneratedLessonContent {
  description: string;
  objectives: string[];
  keyPhrases: KeyPhrase[];
  vocabulary: VocabularyItem[];
  practicalSituations: PracticalSituation[];
  explanations: Explanation[];
  tips: LearningTip[];
  [key: string]: any; // Allow for additional fields
}
