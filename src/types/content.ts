export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'VOICE_RESPONSE';

export interface QuizQuestion {
  id: string;
  question: string;
  questionType: QuestionType;
  // MULTIPLE_CHOICE
  options?: string[];
  correctAnswer?: string;
  // TRUE_FALSE
  // correctAnswer: 'True' | 'False'
  // VOICE_RESPONSE
  acceptedAnswers?: string[];
}

export interface Topic {
  id: string;
  title: string;
  videoUrl: string;
  questions: QuizQuestion[];
}

export interface Subject {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Grade {
  id: string;
  title: string;
  subjects: Subject[];
  isPremium?: boolean;
}
