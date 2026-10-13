import { X } from 'lucide-react';
import { useMemo, useState } from 'react';

import ArtistCard from './ArtistCard';
import { useData } from '../DataContext';
import { artistsCount } from '../utils';

function Artists() {
  const [artistPattern, setArtistPattern] = useState('');

  const { albumAggregates } = useData();

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
      <h1 className="heading-display">Artists</h1>
      <p className="heading-item-count">
        {artistsCount(albumAggregates)} artists
      </p>
      <div className="filter">
        <input
          className="filter__input"
          type="text"
          value={artistPattern}
          onChange={(e) => setArtistPattern(e.target.value)}
        />

        {artistPattern && (
          <button
            type="button"
            className="filter__clear"
            onClick={() => setArtistPattern('')}
          >
            <X size={16} />
          </button>
        )}
      </div>
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
