import type { QuizQuestion } from '../../types/content';
import type { QuizPhase } from '../../hooks/useTutorState';
import './QuizScreen.css';

interface QuizScreenProps {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
  phase: QuizPhase;
  feedback: 'correct' | 'incorrect' | null;
  selectedOptionIndex: number;
  isRecording: boolean;
  voiceTranscript: string | null;
}

const QuizScreen = ({
  questions,
  currentQuestionIndex,
  totalQuestions,
  score,
  phase,
  feedback,
  selectedOptionIndex,
  isRecording,
  voiceTranscript,
}: QuizScreenProps) => {

  // ── Complete screen ────────────────────────────────────────────────────────
  if (phase === 'complete') {
    const percentage = totalQuestions > 0
      ? Math.round((score / totalQuestions) * 100)
      : 0;
    const emoji = percentage >= 80 ? '🏆' : percentage >= 50 ? '⭐' : '💪';
    return (
      <div className="quiz-screen result-screen">
        <div className="result-emoji">{emoji}</div>
        <h2 className="result-title">Quiz Complete!</h2>
        <div className="score-display">{score} / {totalQuestions}</div>
        <div className="percentage-display">{percentage}%</div>
        <p className="result-hint">Press <strong>CENTER</strong> to finish</p>
      </div>
    );
  }

  const question = questions[currentQuestionIndex];
  if (!question) return null;

  // ── Feedback overlay ───────────────────────────────────────────────────────
  const renderFeedback = () => {
    if (phase !== 'feedback' || !feedback) return null;
    return (
      <div className={`feedback-banner ${feedback}`}>
        {feedback === 'correct' ? '✅ Correct!' : '❌ Incorrect'}
        <span className="feedback-hint">Press CENTER to continue</span>
      </div>
    );
  };

  // ── MULTIPLE_CHOICE & TRUE_FALSE ───────────────────────────────────────────
  if (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'TRUE_FALSE') {
    return (
      <div className="quiz-screen">
        <div className="quiz-header">
          <span className="q-type-badge">{question.questionType === 'TRUE_FALSE' ? 'True / False' : 'Multiple Choice'}</span>
          <span className="q-counter">{currentQuestionIndex + 1} / {totalQuestions}</span>
        </div>

        <h3 className="question-text">{question.question}</h3>

        <div className="options-list">
          {(question.options || (question.questionType === 'TRUE_FALSE' ? ['True', 'False'] : []))?.map((opt, idx) => (
            <div
              key={idx}
              className={`option-item
                ${idx === selectedOptionIndex ? 'option-selected' : ''}
                ${phase === 'feedback' && opt === question.correctAnswer ? 'option-correct' : ''}
                ${phase === 'feedback' && idx === selectedOptionIndex && opt !== question.correctAnswer ? 'option-wrong' : ''}
              `}
            >
              <span className="option-bullet">{String.fromCharCode(65 + idx)}</span>
              {opt}
            </div>
          ))}
        </div>

        {renderFeedback()}

        {phase === 'question' && (
          <p className="control-hint">↑↓ to select · CENTER to submit</p>
        )}
      </div>
    );
  }

  // ── VOICE_RESPONSE ─────────────────────────────────────────────────────────
  return (
    <div className="quiz-screen">
      <div className="quiz-header">
        <span className="q-type-badge voice-badge">🎤 Voice</span>
        <span className="q-counter">{currentQuestionIndex + 1} / {totalQuestions}</span>
      </div>

      <h3 className="question-text">{question.question}</h3>

      <div className="voice-display">
        {isRecording ? (
          <div className="recording-indicator">
            <div className="recording-dot" />
            <span className="recording-text">Recording...</span>
            <p className="recording-sub">Press CENTER to stop</p>
          </div>
        ) : phase === 'feedback' ? (
          <div className="voice-transcript">
            <p className="transcript-label">You said:</p>
            <p className="transcript-text">"{voiceTranscript}"</p>
          </div>
        ) : (
          <div className="voice-prompt">
            <div className="mic-icon-display">🎤</div>
            <p className="voice-instruction">Press <strong>CENTER</strong> to Answer</p>
          </div>
        )}
      </div>

      {renderFeedback()}
    </div>
  );
};

export default QuizScreen;
