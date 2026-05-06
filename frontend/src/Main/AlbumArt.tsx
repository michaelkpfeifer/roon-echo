import { useContext } from 'react';

import AppContext from '../AppContext';
import Modal from '../support/Modal';

type AlbumArtProps = {
  imageKey: string;
  alt: string;
};

function AlbumArt({ imageKey, alt }: AlbumArtProps) {
  const { coreUrl, isAlbumArtModalOpen, setIsAlbumArtModalOpen } =
    useContext(AppContext);

  return (
    <Modal
      isOpen={isAlbumArtModalOpen}
      onClose={() => setIsAlbumArtModalOpen(false)}
    >
      <img
        src={`${coreUrl}/api/image/${imageKey}?scale=fit&width=500&height=500`}
        alt={alt}
      />
    </Modal>
  );
}

export default AlbumArt;
