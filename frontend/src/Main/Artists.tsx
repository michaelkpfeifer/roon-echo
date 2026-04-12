import { useContext } from 'react';

import AppContext from '../AppContext';
import ArtistCard from './ArtistCard';

function Artists() {
  const { appState } = useContext(AppContext);

  const roonAlbumArtistNames = [
    ...new Set(
      appState.albums
        .filter(
          (album) => album.stage != 'empty' && album.stage != 'withRoonAlbum',
        )
        .map((album) => album.roonAlbum.roonAlbumArtistName),
    ),
  ].sort();

  return (
    <>
      <h1 className="heading-display">Artists</h1>
      <div className="artists-container">
        {roonAlbumArtistNames.map((roonAlbumArtistName) => (
          <div key={roonAlbumArtistName}>
            <ArtistCard roonAlbumArtistName={roonAlbumArtistName} />
          </div>
        ))}
      </div>
    </>
  );
}

export default Artists;
