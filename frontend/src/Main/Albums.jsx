import fp from 'lodash/fp';
import { useContext } from 'react';

import AppContext from '../AppContext';
import AlbumCard from './AlbumCard';

function Albums() {
  const { appState } = useContext(AppContext);

  return (
    <>
      <h1 className="heading-display">Albums</h1>
      <div className="albums-container">
        {fp
          .orderBy(
            [
              'sortKeys.artistNames',
              'sortKeys.releaseDate',
              'sortKeys.albumName',
            ],
            ['asc', 'asc', 'asc'],
            appState.albums,
          )
          .map((album) => (
            <div key={album.roonAlbum.itemKey}>
              <AlbumCard album={album} />
            </div>
          ))}
      </div>
    </>
  );
}

export default Albums;
