import fp from 'lodash/fp';
import { useContext } from 'react';

import AppContext from '../AppContext';
import TrackRow from './TrackRow';

function Tracks() {
  const { appState } = useContext(AppContext);

  const tracks = fp
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
      return album.roonTracks.map((roonTrack) => {
        return {
          roonAlbumArtistName: album.roonAlbum.roonAlbumArtistName,
          roonAlbumImageKey: album.roonAlbum.imageKey,
          roonAlbumItemKey: album.roonAlbum.itemKey,
          roonAlbumName: album.roonAlbum.roonAlbumName,
          roonLength: roonTrack.roonLength,
          roonNumber: roonTrack.roonNumber,
          roonPosition: roonTrack.roonPosition,
          roonTrackName: roonTrack.roonTrackName,
          trackId: roonTrack.trackId,
        };
      });
    })
    .flat();

  return (
    <>
      <h1 className="heading-display">Tracks</h1>
      <div className="tracks-container">
        {tracks.map((track) => (
          <div key={track.trackId}>
            <TrackRow track={track} />
          </div>
        ))}
      </div>
    </>
  );
}

export default Tracks;
