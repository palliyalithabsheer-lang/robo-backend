import { useState, useEffect } from 'react';
import type { Grade, Subject, Topic } from '../types/content';
import type { ProgressData } from '../types/progress';
import type { RobotState } from '../components/EyeSection';
import {
  loadProgress,
  updateTopicProgress,
  loadUnlockedGrades,
  unlockGrade,
} from '../utils/storage';

export type ScreenType =
  | 'grade'
  | 'subject'
  | 'topic'
  | 'action'
  | 'video'
  | 'quiz'
  | 'progress'
  | 'locked';

export type QuizPhase = 'question' | 'feedback' | 'complete';

export type CenterLabel =
  | 'Select'
  | 'Submit'
  | 'Record'
  | 'Stop'
  | 'Next'
  | 'Finish'
  | 'Play'
  | 'Pause'
  | 'Back';

// ── Simulated speech recognition (MVP placeholder) ───────────────────────────
const simulateVoiceAnswer = (): Promise<string> =>
  new Promise((resolve) => {
    // In production this would call the Web Speech API.
    // For MVP we resolve with a placeholder after a short delay.
    setTimeout(() => resolve('carbon dioxide'), 1500);
  });

export const useTutorState = () => {
  const [screen, setScreen] = useState<ScreenType>('grade');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [robotState, setRobotState] = useState<RobotState>('idle');

  // Navigation
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Progress & Subscriptions
  const [progress, setProgress] = useState<ProgressData>({});
  const [unlockedGrades, setUnlockedGrades] = useState<string[]>([]);

  const [content, setContent] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setProgress(loadProgress());
    setUnlockedGrades(loadUnlockedGrades());

    const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;
    fetch(`${API_URL}/api/v1/content?status=published`)
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          // Normalize backend structure to match frontend Topic type
          const normalized = json.data.map((grade: any) => ({
            ...grade,
            subjects: grade.subjects.map((subject: any) => ({
              ...subject,
              topics: subject.topics.map((topic: any) => ({
                id: topic.id,
                title: topic.title,
                // Use first published video URL for the existing VideoScreen
                videoUrl: topic.videos && topic.videos.length > 0 ? topic.videos[0].videoUrl : '',
                // Map backend quiz questions to frontend format
                questions: (topic.questions || []).map((q: any) => ({
                  id: q.id,
                  question: q.question,
                  questionType: q.questionType,
                  options: q.options,
                  correctAnswer: q.correctAnswer,
                  acceptedAnswers: q.acceptedAnswers,
                })),
              }))
            }))
          }));
          setContent(normalized);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch content from server:', err);
        setIsLoading(false);
      });
  }, []);

  // Video
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPhase, setQuizPhase] = useState<QuizPhase>('question');
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'incorrect' | null>(null);
  // For MULTIPLE_CHOICE and TRUE_FALSE: which option index is highlighted
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  // For VOICE_RESPONSE
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);

  // ── Sync robot state ────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen === 'video' && isVideoPlaying) {
      setRobotState('video');
    } else if (screen === 'quiz') {
      if (quizPhase === 'complete') {
        setRobotState('completed');
      } else if (isRecording) {
        setRobotState('listening');
      } else if (quizFeedback === 'correct') {
        setRobotState('correct');
      } else if (quizFeedback === 'incorrect') {
        setRobotState('incorrect');
      } else {
        setRobotState('idle');
      }
    } else {
      setRobotState('idle');
    }
  }, [screen, isVideoPlaying, quizPhase, isRecording, quizFeedback]);

  // ── Derived helpers ─────────────────────────────────────────────────────────
  type MenuItem = { id: string; title: string };
  const gradeMenuItems: MenuItem[] = [
    ...content.map((g: Grade) => ({ id: g.id, title: g.title })),
    { id: 'progress-btn', title: '⭐ My Progress ⭐' },
  ];

  const currentQuestion = selectedTopic?.questions[quizIndex] ?? null;
  const totalQuestions = selectedTopic?.questions.length ?? 0;

  // ── Dynamic CENTER button label ─────────────────────────────────────────────
  const centerLabel: CenterLabel = (() => {
    if (screen === 'video') return isVideoPlaying ? 'Pause' : 'Play';
    if (screen === 'quiz') {
      if (quizPhase === 'complete') return 'Finish';
      if (quizPhase === 'feedback') return 'Next';
      if (!currentQuestion) return 'Next';
      if (currentQuestion.questionType === 'VOICE_RESPONSE') {
        return isRecording ? 'Stop' : 'Record';
      }
      return 'Submit';
    }
    if (screen === 'locked' || screen === 'progress') return 'Back';
    return 'Select';
  })();

  // ── Answer processing ───────────────────────────────────────────────────────
  const processAnswer = (answer: string) => {
    if (!currentQuestion) return;

    setRobotState('thinking');

    setTimeout(() => {
      let isCorrect = false;

      if (currentQuestion.questionType === 'MULTIPLE_CHOICE' || currentQuestion.questionType === 'TRUE_FALSE') {
        isCorrect = answer.toLowerCase().trim() === (currentQuestion.correctAnswer ?? '').toLowerCase().trim();
      } else if (currentQuestion.questionType === 'VOICE_RESPONSE') {
        const lower = answer.toLowerCase().trim();
        isCorrect = (currentQuestion.acceptedAnswers ?? []).some(a => lower.includes(a.toLowerCase()));
      }

      setQuizFeedback(isCorrect ? 'correct' : 'incorrect');
      setQuizPhase('feedback');
      if (isCorrect) setQuizScore(prev => prev + 1);
    }, 500);
  };

  // ── Navigation: UP / DOWN ───────────────────────────────────────────────────
  const handleUp = () => {
    if (screen === 'quiz' && quizPhase === 'question') {
      if (currentQuestion?.questionType === 'MULTIPLE_CHOICE' || currentQuestion?.questionType === 'TRUE_FALSE') {
        setSelectedOptionIndex(prev => Math.max(0, prev - 1));
      }
      return;
    }
    if (['grade', 'subject', 'topic', 'action'].includes(screen)) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    }
  };

  const handleDown = () => {
    if (screen === 'quiz' && quizPhase === 'question') {
      if (currentQuestion?.questionType === 'MULTIPLE_CHOICE' || currentQuestion?.questionType === 'TRUE_FALSE') {
        const max = (currentQuestion.options?.length ?? 2) - 1;
        setSelectedOptionIndex(prev => Math.min(max, prev + 1));
      }
      return;
    }
    if (screen === 'grade') {
      setSelectedIndex(prev => Math.min(gradeMenuItems.length - 1, prev + 1));
    } else if (screen === 'subject' && selectedGrade) {
      setSelectedIndex(prev => Math.min(selectedGrade.subjects.length - 1, prev + 1));
    } else if (screen === 'topic' && selectedSubject) {
      setSelectedIndex(prev => Math.min(selectedSubject.topics.length - 1, prev + 1));
    } else if (screen === 'action') {
      setSelectedIndex(prev => Math.min(1, prev + 1));
    }
  };

  // ── Navigation: LEFT (back) ─────────────────────────────────────────────────
  const handleLeft = () => {
    if (screen === 'subject' || screen === 'progress' || screen === 'locked') {
      setScreen('grade'); setSelectedIndex(0); setSelectedGrade(null);
    } else if (screen === 'topic') {
      setScreen('subject'); setSelectedIndex(0); setSelectedSubject(null);
    } else if (screen === 'action') {
      setScreen('topic'); setSelectedIndex(0); setSelectedTopic(null);
    } else if (screen === 'video') {
      setScreen('action'); setIsVideoPlaying(false); setSelectedIndex(0);
    } else if (screen === 'quiz') {
      // Always go back to action on left (don't go back question-by-question)
      resetQuiz();
      setScreen('action'); setSelectedIndex(1);
    }
  };

  const handleRight = () => { /* reserved */ };

  // ── Navigation: CENTER (select / submit / record / play) ────────────────────
  const handleSelect = () => {
    // ── Menu screens ──
    if (['grade', 'subject', 'topic', 'action'].includes(screen)) {
      handleMenuSelect();
      return;
    }
    if (screen === 'progress' || screen === 'locked') {
      handleLeft(); return;
    }

    // ── Video ──
    if (screen === 'video') {
      setIsVideoPlaying(prev => !prev);
      return;
    }

    // ── Quiz ──
    if (screen === 'quiz') {
      handleQuizSelect();
    }
  };


  const handleMenuSelect = () => {

    if (screen === 'grade') {
      const item = gradeMenuItems[selectedIndex];
      if (item.id === 'progress-btn') { setScreen('progress'); return; }
      const grade = content[selectedIndex];
      if (!grade) return;
      if (grade.isPremium && !unlockedGrades.includes(grade.id)) {
        setSelectedGrade(grade); setScreen('locked'); return;
      }
      setSelectedGrade(grade); setScreen('subject'); setSelectedIndex(0);
    } else if (screen === 'subject' && selectedGrade) {
      const s = selectedGrade.subjects[selectedIndex];
      if (s) { setSelectedSubject(s); setScreen('topic'); setSelectedIndex(0); }
    } else if (screen === 'topic' && selectedSubject) {
      const t = selectedSubject.topics[selectedIndex];
      if (t) { setSelectedTopic(t); setScreen('action'); setSelectedIndex(0); }
    } else if (screen === 'action' && selectedTopic) {
      if (selectedIndex === 0) {
        setScreen('video'); setIsVideoPlaying(true);
      } else {
        startQuiz();
      }
    }
  };

  const handleQuizSelect = () => {
    if (!currentQuestion) return;

    // ── Feedback phase: advance to next question ──
    if (quizPhase === 'feedback') {
      setQuizFeedback(null);
      if (quizIndex < totalQuestions - 1) {
        setQuizIndex(prev => prev + 1);
        setSelectedOptionIndex(0);
        setVoiceTranscript(null);
        setQuizPhase('question');
      } else {
        setQuizPhase('complete');
      }
      return;
    }

    // ── Complete phase: finish quiz ──
    if (quizPhase === 'complete') {
      handleQuizFinish();
      return;
    }

    // ── Question phase ──
    if (currentQuestion.questionType === 'MULTIPLE_CHOICE' || currentQuestion.questionType === 'TRUE_FALSE') {
      const answer = currentQuestion.options?.[selectedOptionIndex] ?? '';
      processAnswer(answer);
    } else if (currentQuestion.questionType === 'VOICE_RESPONSE') {
      if (!isRecording) {
        // Start recording
        setIsRecording(true);
        setVoiceTranscript(null);
        simulateVoiceAnswer().then(transcript => {
          setIsRecording(false);
          setVoiceTranscript(transcript);
          processAnswer(transcript);
        });
      } else {
        // Manual stop (before auto-complete)
        setIsRecording(false);
      }
    }
  };

  // ── Quiz lifecycle ──────────────────────────────────────────────────────────
  const startQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizPhase('question');
    setQuizFeedback(null);
    setSelectedOptionIndex(0);
    setIsRecording(false);
    setVoiceTranscript(null);
    setScreen('quiz');
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizPhase('question');
    setQuizFeedback(null);
    setSelectedOptionIndex(0);
    setIsRecording(false);
    setVoiceTranscript(null);
  };

  const handleQuizFinish = () => {
    if (selectedTopic) {
      setProgress(updateTopicProgress(selectedTopic.id, { quizScore }));
    }
    resetQuiz();
    setScreen('topic');
    setSelectedIndex(0);
    setSelectedTopic(null);
  };

  // ── Video events ────────────────────────────────────────────────────────────
  const handleVideoEnd = () => {
    setIsVideoPlaying(false);
    if (selectedTopic) {
      setProgress(updateTopicProgress(selectedTopic.id, { videoCompleted: true }));
    }
  };

  // ── Subscriptions ───────────────────────────────────────────────────────────
  const handleUnlockGrade = (gradeId: string) => {
    setUnlockedGrades(unlockGrade(gradeId));
  };

  return {
    // Screen & navigation
    screen, selectedIndex, centerLabel, robotState, setRobotState,
    selectedGrade, selectedSubject, selectedTopic,
    // Progress & subscriptions
    progress, unlockedGrades,
    // Video
    isVideoPlaying,
    // Quiz display state
    quizIndex, quizScore, quizPhase, quizFeedback,
    selectedOptionIndex, isRecording, voiceTranscript,
    currentQuestion, totalQuestions,
    // Handlers
    handleUp, handleDown, handleLeft, handleRight, handleSelect,
    handleVideoEnd, handleUnlockGrade,
    // Derived
    gradeMenuItems,
    // Data
    content, isLoading,
  };
};
