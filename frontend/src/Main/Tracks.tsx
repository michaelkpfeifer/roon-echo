import fp from 'lodash/fp';
import { useContext } from 'react';

import type { RoonTrack } from '../../../shared/internal/roonTrack';
import AppContext from '../AppContext';
import TrackRow from './TrackRow';

function Tracks() {
  const { albumAggregates } = useContext(AppContext);

  const tracksWithAlbum = fp
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
    .flat();

  return (
    <>
      <h1 className="heading-display">Tracks</h1>
      <div className="tracks-container">
        {tracksWithAlbum.map(({ roonAlbum, roonTrack }) => (
          <div key={roonTrack.trackId}>
            <TrackRow roonAlbum={roonAlbum} roonTrack={roonTrack} />
          </div>
        ))}
      </div>
    </>
  );
}

export default Tracks;
