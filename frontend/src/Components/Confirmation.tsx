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
      <div>
        <p className="confirmation--header">{question}</p>
      </div>
      <div>
        <button className="button-m" type="button" onClick={onClose}>
          Cancel
        </button>
        <button className="button-m" type="button" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    </Modal>
  );
}

export default Confirmation;
