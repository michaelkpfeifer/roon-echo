import { useContext } from 'react';

import AppContext from '../AppContext';
import Modal from '../support/Modal';

function AlbumArt() {
  const { isAlbumArtModalOpen, setIsAlbumArtModalOpen } =
    useContext(AppContext);

  return (
    <Modal
      isOpen={isAlbumArtModalOpen}
      onClose={() => setIsAlbumArtModalOpen(false)}
    >
      <div>
        <p></p>
      </div>
    </Modal>
  );
}

export default AlbumArt;
