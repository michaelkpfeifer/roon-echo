import fp from 'lodash/fp';
import { useContext } from 'react';

import AppContext from '../AppContext';
import ArtistCard from './ArtistCard';

function Artists() {
  const { appState } = useContext(AppContext);

  const artists = fp.sortBy('sortName', [
    ...new Set(
      appState.albums
        .filter((album) => album.status === 'mbDataLoaded')
        .flatMap((album) => album.mbArtists),
    ),
  ]);

  return (
    <>
      <h1 className="heading-display">Artists</h1>
      <div className="artists-container">
        {artists.map((artist) => (
          <div key={artist.mbArtistId}>
            <ArtistCard artist={artist} />
          </div>
        ))}
      </div>
    </>
  );
}

export default Artists;
