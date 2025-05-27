import fp from 'lodash/fp';
import { useContext } from 'react';

import AppContext from '../AppContext';
import AlbumCardV2 from './AlbumCardV2';

function Albums() {
  const { appState } = useContext(AppContext);

  return (
    <>
      <h1>Albums</h1>
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
              <AlbumCardV2 album={album} />
            </div>
          ))}
      </div>
    </>
  );
}

export default Albums;
