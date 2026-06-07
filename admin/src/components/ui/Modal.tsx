import React from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  children: React.ReactNode;
  submitLabel?: string;
  isDanger?: boolean;
}

const Modal = ({ isOpen, title, onClose, onSubmit, children, submitLabel = "Save", isDanger = false }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
        
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          {onSubmit && (
            <button 
              className={`btn-save ${isDanger ? 'btn-danger' : ''}`} 
              onClick={onSubmit}
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
