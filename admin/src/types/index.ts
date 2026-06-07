import type { Role } from './roles.types';

// ── Mock Users ────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

// ── Content Status ───────────────────────────────────────────────────────────
export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';

// ── Content Types ─────────────────────────────────────────────────────────────
export interface Grade {
  id: string;
  title: string;
  isPremium: boolean;
  subjectCount: number;
  createdAt: string;
}

export interface Subject {
  id: string;
  gradeId: string;
  gradeTitle: string;
  title: string;
  topicCount: number;
  createdAt: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  subjectTitle: string;
  gradeTitle: string;
  title: string;
  videoUrl: string;
  questionCount: number;
  createdAt: string;
}

export interface VideoLesson {
  id: string;
  gradeId: string;
  subjectId: string;
  topicId: string;
  topicTitle: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string; // e.g., "04:30"
  status: ContentStatus;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  gradeId?: string;
  subjectId?: string;
  topicId: string;
  topicTitle: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'VOICE_RESPONSE';
  question: string;
  
  // Multiple Choice / True False
  options?: string[];
  correctAnswer?: string;
  
  // Voice Response
  acceptedAnswers?: string[];
  
  status: ContentStatus;
  createdAt: string;
}

export interface StudyMaterial {
  id: string;
  gradeId?: string;
  subjectId?: string;
  topicId: string;
  topicTitle: string;
  title: string;
  description: string;
  fileType: 'PDF' | 'IMAGE' | 'NOTES' | 'WORKSHEET';
  fileUrl: string;
  status: ContentStatus;
  createdAt: string;
}

// ── Students ──────────────────────────────────────────────────────────────────
export interface Student {
  id: string;
  name: string;
  age: number;
  email: string;
  parentName: string;
  parentEmail: string;
  gradeId: string;
  gradeTitle: string;
  subscriptionPlanId: string;
  status: 'active' | 'inactive';
  joinedAt: string;
  // Performance metrics
  completedTopicsCount: number;
  progressPercentage: number;
  videosWatched: number;
  quizzesDone: number;
  avgScore: number;
}

export interface Subscription {
  id: string;
  studentId: string;
  studentName?: string;
  planId: string;
  planName?: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  accessibleGrades: string[];
  accessibleSubjects: string[];
  createdAt: string;
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export interface DashboardStats {
  totalStudents: number;
  totalSubscriptions: number;
  totalGrades: number;
  totalSubjects: number;
  totalTopics: number;
  totalVideos: number;
  totalQuizQuestions: number;
  monthlyRevenue: number;
  studentGrowth: number;    // % vs last month
  subscriptionGrowth: number;
  activeToday: number;
}

export * from './api.types';
export * from './roles.types';

