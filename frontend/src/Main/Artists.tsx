import { useContext, useMemo, useState } from 'react';

import AppContext from '../AppContext';
import ArtistCard from './ArtistCard';

function Artists() {
  const [artistPattern, setArtistPattern] = useState('');

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

  const filteredRoonAlbumArtistNames = useMemo(() => {
    if (!artistPattern) {
      return roonAlbumArtistNames;
    }

    try {
      const regex = new RegExp(artistPattern, 'i');
      return roonAlbumArtistNames.filter((roonAlbumArtistName) =>
        regex.test(roonAlbumArtistName),
      );
    } catch {
      return roonAlbumArtistNames;
    }

    return roonAlbumArtistNames;
  }, [artistPattern, roonAlbumArtistNames]);

  return (
    <>
      <input
        type="text"
        placeholder="Filter by regular expression ..."
        value={artistPattern}
        onChange={(e) => setArtistPattern(e.target.value)}
      />
      <h1 className="heading-display">Artists</h1>
      <div className="artists-container">
        {filteredRoonAlbumArtistNames.map((roonAlbumArtistName) => (
          <div key={roonAlbumArtistName}>
            <ArtistCard roonAlbumArtistName={roonAlbumArtistName} />
          </div>
        ))}
      </div>
    </>
  );
}

export default Artists;
