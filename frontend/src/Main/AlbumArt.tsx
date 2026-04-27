import { useContext } from 'react';

import AppContext from '../AppContext';
import SimpleModal from '../SimpleModal';

function AlbumArt() {
  const { isAlbumArtModalOpen, setIsAlbumArtModalOpen } =
    useContext(AppContext);

  return (
    <SimpleModal
      isOpen={isAlbumArtModalOpen}
      onClose={() => setIsAlbumArtModalOpen(false)}
    >
      <div>
        <p></p>
      </div>
    </SimpleModal>
  );
}

export default AlbumArt;
