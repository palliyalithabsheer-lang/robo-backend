import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Grade, Subject, Topic, VideoLesson, QuizQuestion, StudyMaterial, SubscriptionPlan, Subscription, Student, ContentStatus } from '../types';
import { grades as initialGrades, subjects as initialSubjects, topics as initialTopics, videos as initialVideos, quizQuestions as initialQuizQuestions, studyMaterials as initialStudyMaterials, subscriptionPlans as initialSubscriptionPlans, subscriptions as initialSubscriptions, students as initialStudents } from '../data/mockData';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1/admin` : 'http://localhost:3000/api/v1/admin';

interface AdminContextType {
  grades: Grade[];
  subjects: Subject[];
  topics: Topic[];
  
  // Grade actions
  addGrade: (grade: Omit<Grade, 'id' | 'subjectCount' | 'createdAt'>) => void;
  updateGrade: (id: string, data: Partial<Omit<Grade, 'id' | 'subjectCount' | 'createdAt'>>) => void;
  deleteGrade: (id: string) => void;
  
  // Subject actions
  addSubject: (subject: Omit<Subject, 'id' | 'topicCount' | 'createdAt' | 'gradeTitle'>) => void;
  updateSubject: (id: string, data: Partial<Omit<Subject, 'id' | 'topicCount' | 'createdAt' | 'gradeTitle'>>) => void;
  deleteSubject: (id: string) => void;
  
  // Topic actions
  addTopic: (topic: Omit<Topic, 'id' | 'questionCount' | 'createdAt' | 'subjectTitle' | 'gradeTitle'>) => void;
  updateTopic: (id: string, data: Partial<Omit<Topic, 'id' | 'questionCount' | 'createdAt' | 'subjectTitle' | 'gradeTitle'>>) => void;
  deleteTopic: (id: string) => void;

  // Video actions
  videos: VideoLesson[];
  addVideo: (video: Omit<VideoLesson, 'id' | 'createdAt' | 'topicTitle'>) => void;
  updateVideo: (id: string, data: Partial<Omit<VideoLesson, 'id' | 'createdAt' | 'topicTitle'>>) => void;
  deleteVideo: (id: string) => void;
  updateVideoStatus: (id: string, status: ContentStatus) => void;

  // Quiz Question actions
  quizQuestions: QuizQuestion[];
  addQuizQuestion: (question: Omit<QuizQuestion, 'id' | 'createdAt' | 'topicTitle'>) => void;
  updateQuizQuestion: (id: string, data: Partial<Omit<QuizQuestion, 'id' | 'createdAt' | 'topicTitle'>>) => void;
  deleteQuizQuestion: (id: string) => void;
  updateQuizQuestionStatus: (id: string, status: ContentStatus) => void;

  // Study Material actions
  studyMaterials: StudyMaterial[];
  addStudyMaterial: (material: Omit<StudyMaterial, 'id' | 'createdAt' | 'topicTitle'>) => void;
  updateStudyMaterial: (id: string, data: Partial<Omit<StudyMaterial, 'id' | 'createdAt' | 'topicTitle'>>) => void;
  deleteStudyMaterial: (id: string) => void;
  updateStudyMaterialStatus: (id: string, status: ContentStatus) => void;

  // Subscription Plan actions
  subscriptionPlans: SubscriptionPlan[];
  subscriptions: Subscription[]; // read-only list for active subscriptions display
  addSubscriptionPlan: (plan: Omit<SubscriptionPlan, 'id' | 'createdAt'>) => void;
  updateSubscriptionPlan: (id: string, data: Partial<Omit<SubscriptionPlan, 'id' | 'createdAt'>>) => void;
  deleteSubscriptionPlan: (id: string) => void;

  // Student actions
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'joinedAt' | 'gradeTitle' | 'completedTopicsCount' | 'progressPercentage' | 'videosWatched' | 'quizzesDone' | 'avgScore'>) => void;
  updateStudent: (id: string, data: Partial<Omit<Student, 'id' | 'joinedAt' | 'gradeTitle' | 'completedTopicsCount' | 'progressPercentage' | 'videosWatched' | 'quizzesDone' | 'avgScore'>>) => void;
  updateStudentStatus: (id: string, status: 'active' | 'inactive') => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [grades, setGrades] = useState<Grade[]>(initialGrades);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [videos, setVideos] = useState<VideoLesson[]>(initialVideos);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(initialQuizQuestions);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(initialStudyMaterials);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(initialSubscriptionPlans);
  const [subscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [students, setStudents] = useState<Student[]>(initialStudents);

  // ── Sync from backend on mount ───────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [gradesRes, subjectsRes, topicsRes, videosRes, quizzesRes, materialsRes] = await Promise.all([
          fetch(`${API}/grades`).then(r => r.json()),
          fetch(`${API}/subjects`).then(r => r.json()),
          fetch(`${API}/topics`).then(r => r.json()),
          fetch(`${API}/videos`).then(r => r.json()),
          fetch(`${API}/quizzes`).then(r => r.json()),
          fetch(`${API}/materials`).then(r => r.json()),
        ]);

        if (gradesRes.data?.length)   setGrades(gradesRes.data.map((g: any) => ({ ...g, isPremium: !!g.isPremium, subjectCount: 0 })));
        if (subjectsRes.data?.length) setSubjects(subjectsRes.data.map((s: any) => ({ ...s, topicCount: 0 })));
        if (topicsRes.data?.length)   setTopics(topicsRes.data);
        if (videosRes.data?.length)   setVideos(videosRes.data);
        if (quizzesRes.data?.length)  setQuizQuestions(quizzesRes.data);
        if (materialsRes.data?.length) setStudyMaterials(materialsRes.data);
      } catch (err) {
        console.warn('Backend not available, using mock data:', err);
      }
    };
    fetchAll();
  }, []);


  // --- Grades ---
  const addGrade = (data: Omit<Grade, 'id' | 'subjectCount' | 'createdAt'>) => {
    const newGrade: Grade = {
      ...data,
      id: `g_${Date.now()}`,
      subjectCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setGrades(prev => [...prev, newGrade]);
    // Sync to backend
    fetch(`${API}/grades`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newGrade }) }).catch(console.warn);
  };

  const updateGrade = (id: string, data: Partial<Omit<Grade, 'id' | 'subjectCount' | 'createdAt'>>) => {
    setGrades(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
    if (data.title) {
      setSubjects(prev => prev.map(s => s.gradeId === id ? { ...s, gradeTitle: data.title as string } : s));
      setTopics(prev => {
        const subjectIds = subjects.filter(s => s.gradeId === id).map(s => s.id);
        return prev.map(t => subjectIds.includes(t.subjectId) ? { ...t, gradeTitle: data.title as string } : t);
      });
    }
    // Sync to backend
    fetch(`${API}/grades/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).catch(console.warn);
  };

  const deleteGrade = (id: string) => {
    setGrades(prev => prev.filter(g => g.id !== id));
    const subjectIds = subjects.filter(s => s.gradeId === id).map(s => s.id);
    setSubjects(prev => prev.filter(s => s.gradeId !== id));
    setTopics(prev => prev.filter(t => !subjectIds.includes(t.subjectId)));
    // Sync to backend (cascade handled by SQLite FK)
    fetch(`${API}/grades/${id}`, { method: 'DELETE' }).catch(console.warn);
  };

  // --- Subjects ---
  const addSubject = (data: Omit<Subject, 'id' | 'topicCount' | 'createdAt' | 'gradeTitle'>) => {
    const parentGrade = grades.find(g => g.id === data.gradeId);
    if (!parentGrade) return;

    const newSubject: Subject = {
      ...data,
      id: `s_${Date.now()}`,
      gradeTitle: parentGrade.title,
      topicCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSubjects(prev => [...prev, newSubject]);
    setGrades(prev => prev.map(g => g.id === data.gradeId ? { ...g, subjectCount: g.subjectCount + 1 } : g));
    fetch(`${API}/subjects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: newSubject.id, gradeId: newSubject.gradeId, title: newSubject.title }) }).catch(console.warn);
  };

  const updateSubject = (id: string, data: Partial<Omit<Subject, 'id' | 'topicCount' | 'createdAt' | 'gradeTitle'>>) => {
    // If gradeId changed, we need to handle the grade counts
    setSubjects(prev => {
      const oldSubject = prev.find(s => s.id === id);
      if (!oldSubject) return prev;

      let newGradeTitle = oldSubject.gradeTitle;
      if (data.gradeId && data.gradeId !== oldSubject.gradeId) {
        const newGrade = grades.find(g => g.id === data.gradeId);
        if (newGrade) newGradeTitle = newGrade.title;
        
        // Update counts
        setGrades(gs => gs.map(g => {
          if (g.id === oldSubject.gradeId) return { ...g, subjectCount: Math.max(0, g.subjectCount - 1) };
          if (g.id === data.gradeId) return { ...g, subjectCount: g.subjectCount + 1 };
          return g;
        }));
      }

      return prev.map(s => s.id === id ? { ...s, ...data, gradeTitle: newGradeTitle } : s);
    });

    // Update subject title in topics if it changed
    if (data.title) {
      setTopics(prev => prev.map(t => t.subjectId === id ? { ...t, subjectTitle: data.title as string } : t));
    }
  };

  const deleteSubject = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    if (!subject) return;

    setSubjects(prev => prev.filter(s => s.id !== id));
    setGrades(prev => prev.map(g => g.id === subject.gradeId ? { ...g, subjectCount: Math.max(0, g.subjectCount - 1) } : g));
    setTopics(prev => prev.filter(t => t.subjectId !== id));
    fetch(`${API}/subjects/${id}`, { method: 'DELETE' }).catch(console.warn);
  };

  // --- Topics ---
  const addTopic = (data: Omit<Topic, 'id' | 'questionCount' | 'createdAt' | 'subjectTitle' | 'gradeTitle'>) => {
    const parentSubject = subjects.find(s => s.id === data.subjectId);
    if (!parentSubject) return;

    const newTopic: Topic = {
      ...data,
      id: `t_${Date.now()}`,
      subjectTitle: parentSubject.title,
      gradeTitle: parentSubject.gradeTitle,
      questionCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTopics(prev => [...prev, newTopic]);
    setSubjects(prev => prev.map(s => s.id === data.subjectId ? { ...s, topicCount: s.topicCount + 1 } : s));
    fetch(`${API}/topics`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: newTopic.id, subjectId: newTopic.subjectId, title: newTopic.title }) }).catch(console.warn);
  };

  const updateTopic = (id: string, data: Partial<Omit<Topic, 'id' | 'questionCount' | 'createdAt' | 'subjectTitle' | 'gradeTitle'>>) => {
    setTopics(prev => {
      const oldTopic = prev.find(t => t.id === id);
      if (!oldTopic) return prev;

      let newSubjectTitle = oldTopic.subjectTitle;
      let newGradeTitle = oldTopic.gradeTitle;

      if (data.subjectId && data.subjectId !== oldTopic.subjectId) {
        const newSubject = subjects.find(s => s.id === data.subjectId);
        if (newSubject) {
          newSubjectTitle = newSubject.title;
          newGradeTitle = newSubject.gradeTitle;
        }

        // Update counts
        setSubjects(ss => ss.map(s => {
          if (s.id === oldTopic.subjectId) return { ...s, topicCount: Math.max(0, s.topicCount - 1) };
          if (s.id === data.subjectId) return { ...s, topicCount: s.topicCount + 1 };
          return s;
        }));
      }

      return prev.map(t => t.id === id ? { ...t, ...data, subjectTitle: newSubjectTitle, gradeTitle: newGradeTitle } : t);
    });
  };

  const deleteTopic = (id: string) => {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;

    setTopics(prev => prev.filter(t => t.id !== id));
    setSubjects(prev => prev.map(s => s.id === topic.subjectId ? { ...s, topicCount: Math.max(0, s.topicCount - 1) } : s));
    setVideos(prev => prev.filter(v => v.topicId !== id));
    setQuizQuestions(prev => prev.filter(q => q.topicId !== id));
    setStudyMaterials(prev => prev.filter(sm => sm.topicId !== id));
    fetch(`${API}/topics/${id}`, { method: 'DELETE' }).catch(console.warn);
  };

  // --- Videos ---
  const addVideo = (data: Omit<VideoLesson, 'id' | 'createdAt' | 'topicTitle'>) => {
    const parentTopic = topics.find(t => t.id === data.topicId);
    if (!parentTopic) return;

    const newVideo: VideoLesson = {
      ...data,
      id: `v_${Date.now()}`,
      topicTitle: parentTopic.title,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setVideos(prev => [...prev, newVideo]);
    fetch(`${API}/videos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: newVideo.id, topicId: newVideo.topicId, title: newVideo.title, description: newVideo.description, videoUrl: newVideo.videoUrl, thumbnailUrl: newVideo.thumbnailUrl, duration: newVideo.duration, status: newVideo.status }) }).catch(console.warn);
  };

  const updateVideo = (id: string, data: Partial<Omit<VideoLesson, 'id' | 'createdAt' | 'topicTitle'>>) => {
    setVideos(prev => {
      const oldVideo = prev.find(v => v.id === id);
      if (!oldVideo) return prev;

      let newTopicTitle = oldVideo.topicTitle;
      if (data.topicId && data.topicId !== oldVideo.topicId) {
        const newTopic = topics.find(t => t.id === data.topicId);
        if (newTopic) newTopicTitle = newTopic.title;
      }

      return prev.map(v => v.id === id ? { ...v, ...data, topicTitle: newTopicTitle } : v);
    });
  };

  const deleteVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    fetch(`${API}/videos/${id}`, { method: 'DELETE' }).catch(console.warn);
  };

  const updateVideoStatus = (id: string, status: ContentStatus) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, status } : v));
    fetch(`${API}/videos/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).catch(console.warn);
  };

  // --- Quiz Questions ---
  const addQuizQuestion = (data: Omit<QuizQuestion, 'id' | 'createdAt' | 'topicTitle'>) => {
    const parentTopic = topics.find(t => t.id === data.topicId);
    if (!parentTopic) return;

    const newQuestion: QuizQuestion = {
      ...data,
      id: `q_${Date.now()}`,
      topicTitle: parentTopic.title,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setQuizQuestions(prev => [...prev, newQuestion]);
    setTopics(prev => prev.map(t => t.id === data.topicId ? { ...t, questionCount: t.questionCount + 1 } : t));
    fetch(`${API}/quizzes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: newQuestion.id, topicId: newQuestion.topicId, questionType: newQuestion.questionType, question: newQuestion.question, options: newQuestion.options, correctAnswer: newQuestion.correctAnswer, acceptedAnswers: newQuestion.acceptedAnswers, status: newQuestion.status }) }).catch(console.warn);
  };

  const updateQuizQuestion = (id: string, data: Partial<Omit<QuizQuestion, 'id' | 'createdAt' | 'topicTitle'>>) => {
    setQuizQuestions(prev => {
      const oldQuestion = prev.find(q => q.id === id);
      if (!oldQuestion) return prev;

      let newTopicTitle = oldQuestion.topicTitle;
      if (data.topicId && data.topicId !== oldQuestion.topicId) {
        const newTopic = topics.find(t => t.id === data.topicId);
        if (newTopic) newTopicTitle = newTopic.title;

        // Update counts
        setTopics(ts => ts.map(t => {
          if (t.id === oldQuestion.topicId) return { ...t, questionCount: Math.max(0, t.questionCount - 1) };
          if (t.id === data.topicId) return { ...t, questionCount: t.questionCount + 1 };
          return t;
        }));
      }

      return prev.map(q => q.id === id ? { ...q, ...data, topicTitle: newTopicTitle } : q);
    });
  };

  const deleteQuizQuestion = (id: string) => {
    const question = quizQuestions.find(q => q.id === id);
    if (!question) return;
    setQuizQuestions(prev => prev.filter(q => q.id !== id));
    setTopics(prev => prev.map(t => t.id === question.topicId ? { ...t, questionCount: Math.max(0, t.questionCount - 1) } : t));
    fetch(`${API}/quizzes/${id}`, { method: 'DELETE' }).catch(console.warn);
  };

  const updateQuizQuestionStatus = (id: string, status: ContentStatus) => {
    setQuizQuestions(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    fetch(`${API}/quizzes/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).catch(console.warn);
  };

  // --- Study Materials ---
  const addStudyMaterial = (data: Omit<StudyMaterial, 'id' | 'createdAt' | 'topicTitle'>) => {
    const parentTopic = topics.find(t => t.id === data.topicId);
    if (!parentTopic) return;

    const newMaterial: StudyMaterial = {
      ...data,
      id: `sm_${Date.now()}`,
      topicTitle: parentTopic.title,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStudyMaterials(prev => [...prev, newMaterial]);
    fetch(`${API}/materials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: newMaterial.id, topicId: newMaterial.topicId, title: newMaterial.title, description: newMaterial.description, fileType: newMaterial.fileType, fileUrl: newMaterial.fileUrl, status: newMaterial.status }) }).catch(console.warn);
  };

  const updateStudyMaterial = (id: string, data: Partial<Omit<StudyMaterial, 'id' | 'createdAt' | 'topicTitle'>>) => {
    setStudyMaterials(prev => {
      const oldMat = prev.find(sm => sm.id === id);
      if (!oldMat) return prev;

      let newTopicTitle = oldMat.topicTitle;
      if (data.topicId && data.topicId !== oldMat.topicId) {
        const newTopic = topics.find(t => t.id === data.topicId);
        if (newTopic) newTopicTitle = newTopic.title;
      }

      return prev.map(sm => sm.id === id ? { ...sm, ...data, topicTitle: newTopicTitle } : sm);
    });
  };

  const deleteStudyMaterial = (id: string) => {
    setStudyMaterials(prev => prev.filter(sm => sm.id !== id));
    fetch(`${API}/materials/${id}`, { method: 'DELETE' }).catch(console.warn);
  };

  const updateStudyMaterialStatus = (id: string, status: ContentStatus) => {
    setStudyMaterials(prev => prev.map(sm => sm.id === id ? { ...sm, status } : sm));
    fetch(`${API}/materials/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).catch(console.warn);
  };

  // --- Subscription Plans ---
  const addSubscriptionPlan = (data: Omit<SubscriptionPlan, 'id' | 'createdAt'>) => {
    const newPlan: SubscriptionPlan = {
      ...data,
      id: `plan_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSubscriptionPlans(prev => [...prev, newPlan]);
  };

  const updateSubscriptionPlan = (id: string, data: Partial<Omit<SubscriptionPlan, 'id' | 'createdAt'>>) => {
    setSubscriptionPlans(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteSubscriptionPlan = (id: string) => {
    setSubscriptionPlans(prev => prev.filter(p => p.id !== id));
  };

  // --- Students ---
  const addStudent = (data: Omit<Student, 'id' | 'joinedAt' | 'gradeTitle' | 'completedTopicsCount' | 'progressPercentage' | 'videosWatched' | 'quizzesDone' | 'avgScore'>) => {
    const parentGrade = grades.find(g => g.id === data.gradeId);
    if (!parentGrade) return;

    const newStudent: Student = {
      ...data,
      id: `st_${Date.now()}`,
      gradeTitle: parentGrade.title,
      joinedAt: new Date().toISOString().split('T')[0],
      completedTopicsCount: 0,
      progressPercentage: 0,
      videosWatched: 0,
      quizzesDone: 0,
      avgScore: 0
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (id: string, data: Partial<Omit<Student, 'id' | 'joinedAt' | 'gradeTitle' | 'completedTopicsCount' | 'progressPercentage' | 'videosWatched' | 'quizzesDone' | 'avgScore'>>) => {
    setStudents(prev => {
      const oldStudent = prev.find(s => s.id === id);
      if (!oldStudent) return prev;

      let newGradeTitle = oldStudent.gradeTitle;
      if (data.gradeId && data.gradeId !== oldStudent.gradeId) {
        const newGrade = grades.find(g => g.id === data.gradeId);
        if (newGrade) newGradeTitle = newGrade.title;
      }

      return prev.map(s => s.id === id ? { ...s, ...data, gradeTitle: newGradeTitle } : s);
    });
  };

  const updateStudentStatus = (id: string, status: 'active' | 'inactive') => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  return (
    <AdminContext.Provider value={{
      grades, subjects, topics, videos, quizQuestions, studyMaterials, subscriptionPlans, subscriptions, students,
      addGrade, updateGrade, deleteGrade,
      addSubject, updateSubject, deleteSubject,
      addTopic, updateTopic, deleteTopic,
      addVideo, updateVideo, deleteVideo, updateVideoStatus,
      addQuizQuestion, updateQuizQuestion, deleteQuizQuestion, updateQuizQuestionStatus,
      addStudyMaterial, updateStudyMaterial, deleteStudyMaterial, updateStudyMaterialStatus,
      addSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan,
      addStudent, updateStudent, updateStudentStatus
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
