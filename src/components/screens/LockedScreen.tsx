import './LockedScreen.css';

interface LockedScreenProps {
  gradeTitle: string;
  onBack: () => void;
}

const LockedScreen = ({ gradeTitle, onBack }: LockedScreenProps) => (
  <div className="locked-screen">
    <div className="lock-icon">🔒</div>
    <h2 className="locked-title">{gradeTitle}</h2>
    <p className="locked-msg">This grade is for Premium members!</p>
    <p className="locked-sub">Ask your parent to unlock it.</p>
    <button className="back-btn" onClick={onBack}>← Go Back</button>
  </div>
);

export default LockedScreen;
