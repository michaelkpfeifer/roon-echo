import PropTypes from 'prop-types';

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

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default Modal;
