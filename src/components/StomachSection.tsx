import './StomachSection.css';
import type { ReactNode } from 'react';

interface StomachSectionProps {
  children: ReactNode;
}

const StomachSection = ({ children }: StomachSectionProps) => {
  return (
    <div className="stomach-section">
      {children}
    </div>
  );
};

export default StomachSection;
