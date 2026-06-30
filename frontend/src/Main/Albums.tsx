import fp from 'lodash/fp';
import { useContext, useMemo, useState } from 'react';

import AppContext from '../AppContext';
import AlbumCard from './AlbumCard';

function Albums() {
  const [albumOrArtistPattern, setAlbumOrArtistPattern] = useState('');
  const { albumAggregates } = useContext(AppContext);

  const filteredAlbumAggregates = useMemo(() => {
    if (!albumOrArtistPattern) {
      return albumAggregates;
    }

    try {
      const regex = new RegExp(albumOrArtistPattern, 'i');
      return albumAggregates.filter(
        (albumAggregate) =>
          albumAggregate.stage !== 'empty' &&
          (regex.test(albumAggregate.roonAlbum.roonAlbumName) ||
            regex.test(albumAggregate.roonAlbum.roonAlbumArtistName)),
      );
    } catch {
      return albumAggregates;
    }
  }, [albumAggregates, albumOrArtistPattern]);

  return (
    <>
      <h1 className="heading-display">Albums</h1>
      <div className="filter">
        <input
          className="filter__input"
          type="text"
          value={albumOrArtistPattern}
          onChange={(e) => setAlbumOrArtistPattern(e.target.value)}
        />
      </div>
      <div className="albums-container">
        {fp
          .orderBy(
            [
              'sortCriteria.artistNames',
              'sortCriteria.mbReleaseDate',
              'sortCriteria.roonAlbumName',
            ],
            ['asc', 'asc', 'asc'],
            filteredAlbumAggregates,
          )
          .map((albumAggregate) => {
            if (
              albumAggregate.stage === 'empty' ||
              albumAggregate.stage === 'withRoonAlbum'
            ) {
              throw new Error(
                `Error: Unexpected albumAggregate stage: ${albumAggregate.stage}`,
              );
            }

            return (
              <div key={albumAggregate.roonAlbum.itemKey}>
                <AlbumCard albumAggregate={albumAggregate} />
              </div>
            );
          })}
      </div>
    </>
  );
}

export default Albums;
