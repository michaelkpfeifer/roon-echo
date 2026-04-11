import fp from 'lodash/fp';
import { useContext } from 'react';

import type { RoonTrack } from '../../../shared/internal/roonTrack';
import AppContext from '../AppContext';
import TrackRow from './TrackRow';

function Tracks() {
  const { appState } = useContext(AppContext);

  const tracksWithAlbum = fp
    .orderBy(
      [
        'sortCriteria.artistNames',
        'sortCriteria.mbReleaseDate',
        'sortCriteria.roonAlbumName',
      ],
      ['asc', 'asc', 'asc'],
      appState.albums,
    )
    .map((album) => {
      if (album.stage === 'empty' || album.stage === 'withRoonAlbum') {
        throw new Error('Error: Cannot render album aggregate without tracks.');
      }

      return album.roonTracks.map((roonTrack: RoonTrack) => {
        return {
          roonAlbum: album.roonAlbum,
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
