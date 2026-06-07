export interface TopicProgress {
  topicId: string;
  videoCompleted: boolean;
  quizScore: number | null;
  maxScore: number;
}

export interface ProgressData {
  [topicId: string]: TopicProgress;
}
