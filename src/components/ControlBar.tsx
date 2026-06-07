import type { CenterLabel } from '../hooks/useTutorState';
import './ControlBar.css';

interface ControlBarProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  onSelect: () => void;
  centerLabel: CenterLabel;
}

const ControlBar = ({ onUp, onDown, onLeft, onRight, onSelect, centerLabel }: ControlBarProps) => {
  // Map label to color class for visual feedback
  const labelClass = {
    Select: 'center-default',
    Submit: 'center-submit',
    Record: 'center-record',
    Stop:   'center-stop',
    Next:   'center-next',
    Finish: 'center-finish',
    Play:   'center-play',
    Pause:  'center-pause',
    Back:   'center-back',
  }[centerLabel] ?? 'center-default';

  return (
    <div className="control-bar">
      <div className="control-pad">
        <button className="nav-btn up-btn" aria-label="Up" onClick={onUp}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>

        <button className="nav-btn left-btn" aria-label="Left" onClick={onLeft}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          className={`select-btn ${labelClass}`}
          aria-label={centerLabel}
          onClick={onSelect}
        >
          {centerLabel}
        </button>

        <button className="nav-btn right-btn" aria-label="Right" onClick={onRight}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <button className="nav-btn down-btn" aria-label="Down" onClick={onDown}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ControlBar;
