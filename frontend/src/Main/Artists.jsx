import { useContext, useEffect } from 'react';

import AppContext from '../AppContext';
import ArtistCard from './ArtistCard';

function Artists() {
  const { appState, socketRef } = useContext(AppContext);

  useEffect(() => {
    socketRef.current.emit('artists');
  }, [socketRef]);

  return (
    <>
      <h1>Artists</h1>
      <div className="artists-container">
        {appState.artists.map((artist) => (
          <div key={artist.item_key}>
            <ArtistCard artist={artist} />
          </div>
        ))}
      </div>
    </>
  );
}

export default Artists;
