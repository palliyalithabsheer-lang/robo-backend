import { useState } from 'react';
import { validateParentPin } from '../../utils/storage';
import './ParentAuthScreen.css';

interface ParentAuthScreenProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ParentAuthScreen = ({ onSuccess, onCancel }: ParentAuthScreenProps) => {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  const handleKey = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (validateParentPin(next)) {
          onSuccess();
        } else {
          setShake(true);
          setPin('');
          setTimeout(() => setShake(false), 600);
        }
      }, 200);
    }
  };

  const handleDelete = () => setPin((p) => p.slice(0, -1));

  return (
    <div className="parent-auth-overlay">
      <div className={`parent-auth-card ${shake ? 'shake' : ''}`}>
        <h2 className="auth-title">🔒 Parent Login</h2>
        <p className="auth-subtitle">Enter your 4-digit PIN</p>

        <div className="pin-dots">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
          ))}
        </div>

        <div className="keypad">
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
            k === '' ? (
              <div key={i} className="key-empty" />
            ) : k === '⌫' ? (
              <button key={i} className="key key-delete" onClick={handleDelete}>{k}</button>
            ) : (
              <button key={i} className="key" onClick={() => handleKey(k)}>{k}</button>
            )
          ))}
        </div>

        <button className="cancel-btn" onClick={onCancel}>Cancel</button>
        <p className="auth-hint">Default PIN: 1234</p>
      </div>
    </div>
  );
};

export default ParentAuthScreen;
