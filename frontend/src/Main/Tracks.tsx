import fp from 'lodash/fp';
import { useMemo, useState } from 'react';

import TrackRow from './TrackRow';
import type { RoonTrack } from '../../../shared/internal/roonTrack';
import { useData } from '../DataContext';
import { tracksCount } from '../utils';

function Tracks() {
  const [albumArtistOrTrackPattern, setAlbumArtistOrTrackPattern] =
    useState('');

  const { albumAggregates } = useData();

  const tracksWithAlbum = useMemo(
    () =>
      fp
        .orderBy(
          [
            'sortCriteria.artistNames',
            'sortCriteria.mbReleaseDate',
            'sortCriteria.roonAlbumName',
          ],
          ['asc', 'asc', 'asc'],
          albumAggregates,
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

          return albumAggregate.roonTracks.map((roonTrack: RoonTrack) => {
            return {
              roonAlbum: albumAggregate.roonAlbum,
              roonTrack,
            };
          });
        })
        .flat(),
    [albumAggregates],
  );

  const filteredTracksWithAlbum = useMemo(() => {
    if (!albumArtistOrTrackPattern) {
      return tracksWithAlbum;
    }

    try {
      const regex = new RegExp(albumArtistOrTrackPattern, 'i');
      return tracksWithAlbum.filter(({ roonAlbum, roonTrack }) => {
        return (
          regex.test(roonAlbum.roonAlbumName) ||
          regex.test(roonAlbum.roonAlbumArtistName) ||
          regex.test(roonTrack.roonTrackName)
        );
      });
    } catch {
      return tracksWithAlbum;
    }
  }, [tracksWithAlbum, albumArtistOrTrackPattern]);

  return (
    <>
      <h1 className="heading-display">Tracks</h1>
      <p className="heading-item-count">
        {tracksCount(albumAggregates)} tracks
      </p>
      <div className="filter">
        <input
          className="filter__input"
          type="text"
          value={albumArtistOrTrackPattern}
          onChange={(e) => setAlbumArtistOrTrackPattern(e.target.value)}
        />
      </div>
      <div className="tracks-container">
        {filteredTracksWithAlbum.map(({ roonAlbum, roonTrack }) => (
          <div key={roonTrack.trackId}>
            <TrackRow roonAlbum={roonAlbum} roonTrack={roonTrack} />
          </div>
        ))}
      </div>
    </>
  );
}

export default Tracks;
