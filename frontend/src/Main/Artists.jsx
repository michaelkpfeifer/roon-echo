import { useContext } from 'react';

import AppContext from '../AppContext';
import ArtistCard from './ArtistCard';

function Artists() {
  const { appState } = useContext(AppContext);

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
