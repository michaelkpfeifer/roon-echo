import { useContext } from 'react';

import AppContext from '../AppContext';
import ArtistCard from './ArtistCard';

function Artists() {
  const { albumAggregates } = useContext(AppContext);

  const roonAlbumArtistNames = [
    ...new Set(
      albumAggregates
        .filter(
          (albumAggregate) =>
            albumAggregate.stage != 'empty' &&
            albumAggregate.stage != 'withRoonAlbum',
        )
        .map((albumAggregate) => albumAggregate.roonAlbum.roonAlbumArtistName),
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
