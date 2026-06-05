import { useContext } from 'react';

import AppContext from '../AppContext';
import Modal from '../support/Modal';
import noAlbumArt from '../images/no-album-art.svg';

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
