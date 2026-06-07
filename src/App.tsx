import { useState } from 'react';
import EyeSection from './components/EyeSection';
import StomachSection from './components/StomachSection';
import ControlBar from './components/ControlBar';
import MenuScreen from './components/screens/MenuScreen';
import TopicActionScreen from './components/screens/TopicActionScreen';
import VideoScreen from './components/screens/VideoScreen';
import QuizScreen from './components/screens/QuizScreen';
import ProgressScreen from './components/screens/ProgressScreen';
import LockedScreen from './components/screens/LockedScreen';
import ParentAuthScreen from './components/parent/ParentAuthScreen';
import ParentDashboard from './components/parent/ParentDashboard';
import { useTutorState } from './hooks/useTutorState';
import './App.css';

function App() {
  const {
    screen, selectedIndex, centerLabel, robotState,
    selectedGrade, selectedSubject, selectedTopic,
    progress, unlockedGrades,
    isVideoPlaying,
    quizIndex, quizScore, quizPhase, quizFeedback,
    selectedOptionIndex, isRecording, voiceTranscript,
    totalQuestions,
    handleUp, handleDown, handleLeft, handleRight, handleSelect,
    handleVideoEnd, handleUnlockGrade,
    gradeMenuItems, isLoading, content,
  } = useTutorState();

  const [showParentAuth, setShowParentAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const renderScreen = () => {
    switch (screen) {
      case 'grade':
        return (
          <MenuScreen
            title="Select Grade"
            items={gradeMenuItems}
            selectedIndex={selectedIndex}
          />
        );
      case 'subject':
        return (
          <MenuScreen
            title="Select Subject"
            items={selectedGrade?.subjects || []}
            selectedIndex={selectedIndex}
          />
        );
      case 'topic':
        return (
          <MenuScreen
            title="Select Topic"
            items={selectedSubject?.topics || []}
            selectedIndex={selectedIndex}
          />
        );
      case 'action':
        return (
          <TopicActionScreen
            topicTitle={selectedTopic?.title || ''}
            selectedIndex={selectedIndex}
          />
        );
      case 'progress':
        return <ProgressScreen progress={progress} content={content} />;
      case 'locked':
        return (
          <LockedScreen
            gradeTitle={selectedGrade?.title || ''}
            onBack={handleLeft}
          />
        );
      case 'video':
        return (
          <VideoScreen
            title={selectedTopic?.title || ''}
            videoUrl={getVideoUrl()}
            playState={isVideoPlaying}
            onVideoEnd={handleVideoEnd}
          />
        );
      case 'quiz':
        return (
          <QuizScreen
            questions={selectedTopic?.questions || []}
            currentQuestionIndex={quizIndex}
            totalQuestions={totalQuestions}
            score={quizScore}
            phase={quizPhase}
            feedback={quizFeedback}
            selectedOptionIndex={selectedOptionIndex}
            isRecording={isRecording}
            voiceTranscript={voiceTranscript}
          />
        );
      default:
        return null;
    }
  };

  // Get the first published video URL from the topic's videos array (from backend)
  const getVideoUrl = () => {
    const topic = selectedTopic as any;
    if (!topic) return '';
    if (topic.videos && topic.videos.length > 0) return topic.videos[0].videoUrl;
    return topic.videoUrl || '';
  };

  if (isLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🤖</div>
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="robot-viewport">
        {/* Parent Portal trigger */}
        <button
          className="parent-gear-btn"
          onClick={() => setShowParentAuth(true)}
          title="Parent Login"
          aria-label="Open Parent Portal"
        >
          ⚙️
        </button>

        <EyeSection state={robotState} />
        <StomachSection>{renderScreen()}</StomachSection>
        <ControlBar
          onUp={handleUp}
          onDown={handleDown}
          onLeft={handleLeft}
          onRight={handleRight}
          onSelect={handleSelect}
          centerLabel={centerLabel}
        />
      </div>

      {showParentAuth && (
        <ParentAuthScreen
          onSuccess={() => { setShowParentAuth(false); setShowDashboard(true); }}
          onCancel={() => setShowParentAuth(false)}
        />
      )}

      {showDashboard && (
        <ParentDashboard
          progress={progress}
          unlockedGrades={unlockedGrades}
          onUnlock={handleUnlockGrade}
          onClose={() => setShowDashboard(false)}
          content={content}
        />
      )}
    </div>
  );
}

export default App;
