import React from 'react';
import './styles/modal.css';

function Modal({ isOpen, onClose, onConfirm, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>
          &times;
        </button>
        {children}
        <button
          type="button"
          className="modal-confirm"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

export default Modal;
