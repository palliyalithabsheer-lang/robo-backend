import { useEffect, useRef, useState } from 'react';
import './VideoScreen.css';

interface VideoScreenProps {
  title: string;
  videoUrl: string;
  onVideoEnd: () => void;
  playState: boolean; // Managed by parent via control bar
}

const VideoScreen = ({ title, videoUrl, onVideoEnd, playState }: VideoScreenProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showStartQuiz, setShowStartQuiz] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (playState) {
        videoRef.current.play().catch(e => console.error("Playback failed", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [playState]);

  const handleEnded = () => {
    setShowStartQuiz(true);
    onVideoEnd();
  };

  return (
    <div className="video-screen">
      <h2 className="video-title">{title}</h2>
      <div className="video-container">
        <video 
          ref={videoRef}
          src={videoUrl?.replace('http://localhost:3000', `http://${window.location.hostname}:3000`)} 
          className="video-player"
          onEnded={handleEnded}
          playsInline
        />
        {!playState && !showStartQuiz && (
          <div className="play-overlay">Paused</div>
        )}
      </div>
      {showStartQuiz && (
        <div className="quiz-prompt selected">
          Start Quiz
        </div>
      )}
    </div>
  );
};

export default VideoScreen;
