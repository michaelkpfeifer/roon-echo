import { useContext, useEffect } from 'react';

import AppContext from '../AppContext';
import AlbumCard from './AlbumCard';

function Albums() {
  const { appState, socketRef } = useContext(AppContext);

  useEffect(() => {
    socketRef.current.emit('albums');
  }, [socketRef]);

  return (
    <>
      <h1>Albums</h1>
      <div className="albums-container">
        {appState.albums.map((album) => (
          <div key={album.roonAlbum.itemKey}>
            <AlbumCard album={album} />
          </div>
        ))}
      </div>
    </>
  );
}

export default Albums;
