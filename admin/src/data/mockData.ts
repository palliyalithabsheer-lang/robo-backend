import type {
  DashboardStats, Grade, Subject, Topic,
  QuizQuestion, Student, Subscription, AdminUser, VideoLesson,
  StudyMaterial, SubscriptionPlan
} from '../types';

// ── Admin User ────────────────────────────────────────────────────────────────
export const currentAdmin: AdminUser = {
  id: 'admin_1',
  name: 'Sarah Johnson',
  email: 'sarah@tutorrobot.ai',
  role: 'super_admin',
  avatar: 'SJ',
};

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export const dashboardStats: DashboardStats = {
  totalStudents: 1284,
  totalSubscriptions: 847,
  totalGrades: 6,
  totalSubjects: 18,
  totalTopics: 64,
  totalVideos: 64,
  totalQuizQuestions: 312,
  monthlyRevenue: 4235,
  studentGrowth: 12.4,
  subscriptionGrowth: 8.7,
  activeToday: 42
};

// ── Analytics / Reports Data ──────────────────────────────────────────────────
export const studentGrowthData = [
  { month: 'Jan', students: 120, subscriptions: 80 },
  { month: 'Feb', students: 150, subscriptions: 110 },
  { month: 'Mar', students: 200, subscriptions: 160 },
  { month: 'Apr', students: 240, subscriptions: 190 },
  { month: 'May', students: 310, subscriptions: 260 },
  { month: 'Jun', students: 400, subscriptions: 350 },
];

export const topicCompletionData = [
  { topic: 'Photosynthesis', completionRate: 85 },
  { topic: 'Fractions', completionRate: 60 },
  { topic: 'Solar System', completionRate: 92 },
  { topic: 'Grammar Basics', completionRate: 75 },
  { topic: 'World War II', completionRate: 50 },
];

export const quizScoreData = [
  { grade: 'Grade 1', avgScore: 90 },
  { grade: 'Grade 2', avgScore: 85 },
  { grade: 'Grade 3', avgScore: 88 },
  { grade: 'Grade 4', avgScore: 76 },
  { grade: 'Grade 5', avgScore: 82 },
  { grade: 'Grade 6', avgScore: 78 },
];

// ── Activity Feed ─────────────────────────────────────────────────────────────
export const recentActivity = [
  { id: 1, type: 'student', message: 'New student Aisha Khan enrolled in Grade 5', time: '2 min ago', icon: '👤' },
  { id: 2, type: 'subscription', message: 'Premium subscription activated for Grade 6', time: '14 min ago', icon: '⭐' },
  { id: 3, type: 'content', message: 'New topic "Atoms & Molecules" published', time: '1h ago', icon: '📘' },
  { id: 4, type: 'quiz', message: '5 new quiz questions added to Photosynthesis', time: '2h ago', icon: '✅' },
  { id: 5, type: 'student', message: 'Rayan Ali completed Photosynthesis quiz (90%)', time: '3h ago', icon: '🏆' },
  { id: 6, type: 'subscription', message: 'Subscription expired for parent@email.com', time: '5h ago', icon: '⚠️' },
];

// ── Grades ────────────────────────────────────────────────────────────────────
export const grades: Grade[] = [
  { id: 'g1', title: 'Grade 1', isPremium: false, subjectCount: 3, createdAt: '2025-01-10' },
  { id: 'g2', title: 'Grade 2', isPremium: false, subjectCount: 3, createdAt: '2025-01-10' },
  { id: 'g3', title: 'Grade 3', isPremium: false, subjectCount: 3, createdAt: '2025-01-15' },
  { id: 'g4', title: 'Grade 4', isPremium: false, subjectCount: 3, createdAt: '2025-02-01' },
  { id: 'g5', title: 'Grade 5', isPremium: false, subjectCount: 3, createdAt: '2025-02-10' },
  { id: 'g6', title: 'Grade 6', isPremium: true, subjectCount: 2, createdAt: '2025-03-01' },
];

// ── Subjects ──────────────────────────────────────────────────────────────────
export const subjects: Subject[] = [
  { id: 's1', gradeId: 'g5', gradeTitle: 'Grade 5', title: 'Science', topicCount: 3, createdAt: '2025-02-10' },
  { id: 's2', gradeId: 'g5', gradeTitle: 'Grade 5', title: 'Mathematics', topicCount: 0, createdAt: '2025-02-10' },
  { id: 's3', gradeId: 'g5', gradeTitle: 'Grade 5', title: 'English', topicCount: 0, createdAt: '2025-02-10' },
  { id: 's4', gradeId: 'g6', gradeTitle: 'Grade 6', title: 'Science', topicCount: 1, createdAt: '2025-03-01' },
  { id: 's5', gradeId: 'g6', gradeTitle: 'Grade 6', title: 'Mathematics', topicCount: 0, createdAt: '2025-03-01' },
  { id: 's6', gradeId: 'g4', gradeTitle: 'Grade 4', title: 'Science', topicCount: 2, createdAt: '2025-02-01' },
];

// ── Topics ────────────────────────────────────────────────────────────────────
export const topics: Topic[] = [
  { id: 't1', subjectId: 's1', subjectTitle: 'Science', gradeTitle: 'Grade 5', title: 'Photosynthesis', videoUrl: 'https://example.com/v1', questionCount: 10, createdAt: '2025-02-15' },
  { id: 't2', subjectId: 's1', subjectTitle: 'Science', gradeTitle: 'Grade 5', title: 'Plant Parts', videoUrl: 'https://example.com/v2', questionCount: 2, createdAt: '2025-02-20' },
  { id: 't3', subjectId: 's1', subjectTitle: 'Science', gradeTitle: 'Grade 5', title: 'Plant Growth', videoUrl: 'https://example.com/v3', questionCount: 2, createdAt: '2025-02-25' },
  { id: 't4', subjectId: 's4', subjectTitle: 'Science', gradeTitle: 'Grade 6', title: 'Atoms & Molecules', videoUrl: 'https://example.com/v4', questionCount: 3, createdAt: '2025-03-05' },
  { id: 't5', subjectId: 's6', subjectTitle: 'Science', gradeTitle: 'Grade 4', title: 'The Water Cycle', videoUrl: 'https://example.com/v5', questionCount: 5, createdAt: '2025-02-05' },
];

// ── Quiz Questions ────────────────────────────────────────────────────────────
export const quizQuestions: QuizQuestion[] = [
  { id: 'q1', topicId: 't1', topicTitle: 'Photosynthesis', questionType: 'MULTIPLE_CHOICE', question: 'Which gas do plants absorb during photosynthesis?', status: 'published', createdAt: '2025-02-15' },
  { id: 'q2', topicId: 't1', topicTitle: 'Photosynthesis', questionType: 'TRUE_FALSE', question: 'Plants produce oxygen during photosynthesis.', status: 'published', createdAt: '2025-02-15' },
  { id: 'q3', topicId: 't1', topicTitle: 'Photosynthesis', questionType: 'VOICE_RESPONSE', question: 'Name the green pigment used in photosynthesis.', status: 'draft', createdAt: '2025-02-16' },
  { id: 'q4', topicId: 't4', topicTitle: 'Atoms & Molecules', questionType: 'MULTIPLE_CHOICE', question: 'What is the smallest unit of matter?', status: 'review', createdAt: '2025-03-05' },
  { id: 'q5', topicId: 't5', topicTitle: 'The Water Cycle', questionType: 'TRUE_FALSE', question: 'Evaporation is part of the water cycle.', status: 'published', createdAt: '2025-02-06' },
];

// ── Videos ────────────────────────────────────────────────────────────────────
export const videos: VideoLesson[] = [
  {
    id: 'v1',
    gradeId: 'g5',
    subjectId: 's1',
    topicId: 't1',
    topicTitle: 'Photosynthesis',
    title: 'Introduction to Photosynthesis',
    description: 'Learn how plants make their own food using sunlight.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80',
    duration: '04:30',
    status: 'published',
    createdAt: '2025-02-15'
  },
  {
    id: 'v2',
    gradeId: 'g5',
    subjectId: 's1',
    topicId: 't2',
    topicTitle: 'Plant Parts',
    title: 'Roots, Stems, and Leaves',
    description: 'A deep dive into the parts of a plant and what they do.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587334274328-64186a80aeee?w=400&q=80',
    duration: '06:15',
    status: 'draft',
    createdAt: '2025-02-20'
  }
];

// ── Study Materials ───────────────────────────────────────────────────────────
export const studyMaterials: StudyMaterial[] = [
  {
    id: 'sm1',
    gradeId: 'g5',
    subjectId: 's1',
    topicId: 't1',
    topicTitle: 'Photosynthesis',
    title: 'Photosynthesis Diagram',
    description: 'A detailed diagram of the photosynthesis process.',
    fileType: 'IMAGE',
    fileUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80',
    status: 'published',
    createdAt: '2025-02-15'
  },
  {
    id: 'sm2',
    gradeId: 'g5',
    subjectId: 's1',
    topicId: 't1',
    topicTitle: 'Photosynthesis',
    title: 'Chapter 4 Worksheet',
    description: 'Practice questions for the photosynthesis chapter.',
    fileType: 'WORKSHEET',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    status: 'draft',
    createdAt: '2025-02-16'
  }
];

// ── Students ──────────────────────────────────────────────────────────────────
export const students: Student[] = [
  { id: 'st1', name: 'Aisha Khan', age: 10, email: 'aisha.student@email.com', parentName: 'Ahmed Khan', parentEmail: 'parent.khan@email.com', gradeId: 'g5', gradeTitle: 'Grade 5', subscriptionPlanId: 'plan_basic', status: 'active', joinedAt: '2025-03-01', completedTopicsCount: 2, progressPercentage: 15, videosWatched: 8, quizzesDone: 6, avgScore: 82 },
  { id: 'st2', name: 'Marcus Johnson', age: 13, email: 'marcus.j@email.com', parentName: 'David Johnson', parentEmail: 'mj.dad@email.com', gradeId: 'g8', gradeTitle: 'Grade 8', subscriptionPlanId: 'plan_premium', status: 'active', joinedAt: '2025-02-10', completedTopicsCount: 15, progressPercentage: 65, videosWatched: 25, quizzesDone: 20, avgScore: 91 },
  { id: 'st3', name: 'Zara Hussain', age: 9, email: 'zara.h@email.com', parentName: 'Fatima Hussain', parentEmail: 'hussain.home@email.com', gradeId: 'g4', gradeTitle: 'Grade 4', subscriptionPlanId: 'plan_basic', status: 'inactive', joinedAt: '2025-03-10', completedTopicsCount: 1, progressPercentage: 5, videosWatched: 4, quizzesDone: 3, avgScore: 70 },
  { id: 'st4', name: 'Omar Farooq', age: 10, email: 'omar.f@email.com', parentName: 'Yusuf Farooq', parentEmail: 'farooq.family@email.com', gradeId: 'g5', gradeTitle: 'Grade 5', subscriptionPlanId: 'plan_premium', status: 'active', joinedAt: '2025-01-15', completedTopicsCount: 22, progressPercentage: 85, videosWatched: 12, quizzesDone: 10, avgScore: 88 },
  { id: 'st5', name: 'Sara Ahmed', age: 11, email: 'sara.a@email.com', parentName: 'Aisha Ahmed', parentEmail: 'ahmed.parent@email.com', gradeId: 'g6', gradeTitle: 'Grade 6', subscriptionPlanId: 'plan_premium', status: 'active', joinedAt: '2025-02-01', completedTopicsCount: 30, progressPercentage: 92, videosWatched: 20, quizzesDone: 18, avgScore: 95 },
  { id: 'st6', name: 'Zoe Chen', age: 7, email: 'zoe.c@email.com', parentName: 'Michael Chen', parentEmail: 'chen.family@email.com', gradeId: 'g2', gradeTitle: 'Grade 2', subscriptionPlanId: 'plan_standard', status: 'active', joinedAt: '2025-01-15', completedTopicsCount: 4, progressPercentage: 20, videosWatched: 3, quizzesDone: 2, avgScore: 75 }
];

// ── Subscriptions & Plans ───────────────────────────────────────────────────────
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan_basic',
    name: 'Basic',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    accessibleGrades: ['g1', 'g2', 'g3'],
    accessibleSubjects: [], // empty implies all in grade, or mock specific ones
    createdAt: '2024-12-01'
  },
  {
    id: 'plan_standard',
    name: 'Standard',
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    accessibleGrades: ['g1', 'g2', 'g3', 'g4', 'g5'],
    accessibleSubjects: [],
    createdAt: '2024-12-01'
  },
  {
    id: 'plan_premium',
    name: 'Premium',
    monthlyPrice: 29.99,
    yearlyPrice: 299.99,
    accessibleGrades: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'],
    accessibleSubjects: [], // all subjects
    createdAt: '2024-12-01'
  }
];

export const subscriptions: Subscription[] = [
  { 
    id: 'sub1', 
    studentId: 'st1', 
    studentName: 'Aisha Khan',
    planId: 'plan_basic', 
    planName: 'Basic',
    status: 'expired', 
    startDate: '2025-03-01', 
    endDate: '2025-04-01' 
  },
  { 
    id: 'sub2', 
    studentId: 'st2', 
    studentName: 'Marcus Johnson',
    planId: 'plan_premium', 
    planName: 'Premium',
    status: 'active', 
    startDate: '2025-02-10', 
    endDate: '2026-02-10' 
  },
  { 
    id: 'sub3', 
    studentId: 'st3', 
    studentName: 'Zoe Chen',
    planId: 'plan_standard', 
    planName: 'Standard',
    status: 'active', 
    startDate: '2025-01-15', 
    endDate: '2025-07-15' 
  }
];
