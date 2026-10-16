import type { Dispatch, SetStateAction } from 'react';

import { useApp } from '../AppContext';
import Modal from '../Components/Modal';
import noAlbumArt from '../images/no-album-art.svg';

type AlbumArtProps = {
  imageKey: string;
  isAlbumArtModalOpen: boolean;
  setIsAlbumArtModalOpen: Dispatch<SetStateAction<boolean>>;
  alt: string;
};

function AlbumArt({
  alt,
  imageKey,
  isAlbumArtModalOpen,
  setIsAlbumArtModalOpen,
}: AlbumArtProps) {
  const { coreUrl } = useApp();

  return (
    <Modal
      isOpen={isAlbumArtModalOpen}
      onClose={() => setIsAlbumArtModalOpen(false)}
    >
      {imageKey ? (
        <img
          src={`${coreUrl}/api/image/${imageKey}?scale=fit&width=500&height=500`}
          alt={alt}
          className="album-art__image"
        />
      ) : (
        <img src={noAlbumArt} alt={alt} className="album-art__image" />
      )}
    </Modal>
  );
}

export default AlbumArt;
