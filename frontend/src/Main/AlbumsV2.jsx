import fp from 'lodash/fp';
import { useContext } from 'react';

import AppContext from '../AppContext';
import AlbumCardV2 from './AlbumCardV2';

function AlbumsV2() {
  const { appState } = useContext(AppContext);

  return (
    <>
      <h1>Albums V2</h1>
      <div className="albums-container">
        {fp
          .orderBy(
            [
              'sortKeys.albumArtist',
              'sortKeys.releaseDate',
              'sortKeys.albumTitle',
            ],
            ['asc', 'asc', 'asc'],
            appState.albumsV2,
          )
          .map((album) => (
            <div key={album.roonData.itemKey}>
              <AlbumCardV2 album={album} />
            </div>
          ))}
      </div>{' '}
    </>
  );
}

export default AlbumsV2;
