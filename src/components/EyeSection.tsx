import { useEffect, useState } from 'react';
import './EyeSection.css';

export type RobotState = 'idle' | 'listening' | 'thinking' | 'correct' | 'incorrect' | 'completed' | 'video';

interface EyeSectionProps {
  state: RobotState;
}

const EyeSection = ({ state }: EyeSectionProps) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      // Don't blink while thinking, correct, incorrect, or video to maintain expressions
      if (['idle', 'listening', 'completed'].includes(state)) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 200);
      }
    }, 4000);

    return () => clearInterval(blinkInterval);
  }, [state]);

  return (
    <div className="eye-section">
      <div className={`eye eye-state-${state} ${isBlinking ? 'blink' : ''}`}>
        <div className="pupil"></div>
      </div>
      <div className={`eye eye-state-${state} ${isBlinking ? 'blink' : ''}`}>
        <div className="pupil"></div>
      </div>
    </div>
  );
};

export default EyeSection;
