import { useContext } from 'react';

import AppContext from '../AppContext';
import AlbumCard from './AlbumCard';

function Albums() {
  const { appState } = useContext(AppContext);

  if (appState.selectedScreen !== 'albums') {
    return null;
  }

  return (
    <>
      <h1>Albums</h1>
      <div className="albums-container">
        {appState.albums.map((album) => (
          <div key={album.item_key}>
            <AlbumCard album={album} />
          </div>
        ))}
      </div>
    </>
  );
}

export default Albums;
