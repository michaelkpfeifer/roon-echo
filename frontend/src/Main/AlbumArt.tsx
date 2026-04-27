import { useContext } from 'react';

import AppContext from '../AppContext';
import Modal from '../support/Modal';

type AlbumArtProps = {
  imageKey: string;
};

function AlbumArt({ imageKey }: AlbumArtProps) {
  const { coreUrl, isAlbumArtModalOpen, setIsAlbumArtModalOpen } =
    useContext(AppContext);

  return (
    <Modal
      isOpen={isAlbumArtModalOpen}
      onClose={() => setIsAlbumArtModalOpen(false)}
    >
      <img
        src={`${coreUrl}/api/image/${imageKey}?scale=fit&width=500&height=500`}
      />
    </Modal>
  );
}

export default AlbumArt;
