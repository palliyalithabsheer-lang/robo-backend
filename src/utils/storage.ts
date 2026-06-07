import type { ProgressData, TopicProgress } from '../types/progress';

const PROGRESS_KEY = 'tutor_robot_progress';
const SUBSCRIPTIONS_KEY = 'tutor_robot_subscriptions';
const PARENT_PIN_KEY = 'tutor_robot_parent_pin';
const DEFAULT_PIN = '1234';

// ─── Progress ────────────────────────────────────────────────────────────────

export const loadProgress = (): ProgressData => {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const saveProgress = (data: ProgressData): void => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
};

export const updateTopicProgress = (
  topicId: string,
  updates: Partial<TopicProgress>
): ProgressData => {
  const current = loadProgress();
  const existing = current[topicId] || {
    topicId,
    videoCompleted: false,
    quizScore: null,
    maxScore: 0,
  };

  // Only keep the higher quiz score
  if (updates.quizScore !== undefined && updates.quizScore !== null) {
    if (existing.quizScore === null || updates.quizScore > existing.quizScore) {
      existing.quizScore = updates.quizScore;
    }
    delete updates.quizScore;
  }

  current[topicId] = { ...existing, ...updates };
  saveProgress(current);
  return current;
};

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const loadUnlockedGrades = (): string[] => {
  try {
    const data = localStorage.getItem(SUBSCRIPTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const unlockGrade = (gradeId: string): string[] => {
  const current = loadUnlockedGrades();
  if (!current.includes(gradeId)) {
    current.push(gradeId);
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(current));
  }
  return current;
};

export const isGradeUnlocked = (gradeId: string): boolean => {
  return loadUnlockedGrades().includes(gradeId);
};

// ─── Parent PIN ───────────────────────────────────────────────────────────────

export const getParentPin = (): string => {
  return localStorage.getItem(PARENT_PIN_KEY) || DEFAULT_PIN;
};

export const setParentPin = (pin: string): void => {
  localStorage.setItem(PARENT_PIN_KEY, pin);
};

export const validateParentPin = (pin: string): boolean => {
  return pin === getParentPin();
};
