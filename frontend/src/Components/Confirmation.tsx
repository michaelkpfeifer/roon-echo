import Modal from './Modal';

type ConfirmationProps = {
  question: string;
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

function Confirmation({
  question,
  isOpen,
  onConfirm,
  onClose,
}: ConfirmationProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="confirmation">
        <div>
          <p className="confirmation--question">{question}</p>
        </div>
        <div className="confirmation--buttons">
          <button className="button-m" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="button-m button--danger"
            type="button"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default Confirmation;
