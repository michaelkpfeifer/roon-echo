type SimpleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

function SimpleModal({ isOpen, onClose, children }: SimpleModalProps) {
  if (!isOpen) return null;

  return (
    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
    /* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  );
}

export default SimpleModal;
