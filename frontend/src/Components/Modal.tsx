import { useEffect, useRef } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    /* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
    <div
      className="modal-overlay"
      data-testid="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        ref={modalRef}
      >
        <button type="button" className="modal-close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
