import fp from 'lodash/fp';
import { useContext, useMemo, useRef, useState } from 'react';

import type { AlbumAggregate } from '../../../shared/internal/albumAggregate';
import AppContext from '../AppContext';
import AlbumCard from './AlbumCard';
import { albumsCount } from '../utils';

function Albums() {
  const [albumOrArtistPattern, setAlbumOrArtistPattern] = useState('');
  const [selectedAlbumIds, setSelectedAlbumIds] = useState(() => new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const longPressFiredRef = useRef<boolean>(false);
  const pressStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    albumAggregate: AlbumAggregate,
  ): void => {
    if (e.pointerType === 'mouse' && e.button != 0) {
      return;
    }

    if (
      albumAggregate.stage === 'empty' ||
      albumAggregate.stage === 'withRoonAlbum'
    ) {
      throw new Error(
        `Error: Unexpected albumAggregate stage: ${albumAggregate.stage}`,
      );
    }

    longPressFiredRef.current = false;
    pressStartRef.current = { x: e.clientX, y: e.clientY };
    pressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      setSelectionMode(true);
      setSelectedAlbumIds(new Set([albumAggregate.id]));
    }, 450);
  };

  return (
    <>
      <h1 className="heading-display">Albums</h1>
      <p className="heading-item-count">
        {albumsCount(albumAggregates)} albums
      </p>
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
                <AlbumCard
                  albumAggregate={albumAggregate}
                  handlePointerDown={handlePointerDown}
                />
              </div>
            );
          })}
      </div>
    </>
  );
}

export default Albums;
