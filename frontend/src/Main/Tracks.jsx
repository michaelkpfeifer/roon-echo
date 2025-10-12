import fp from 'lodash/fp';
import { useContext } from 'react';

import AppContext from '../AppContext';
import TrackRow from './TrackRow';

function Tracks() {
  const { appState } = useContext(AppContext);

  const tracks = fp
    .sortBy(
      (album) => album.mbArtists[0].sortName,
      appState.albums.filter((album) => album.status === 'mbDataLoaded'),
    )
    .map((album) =>
      album.mbTracks.map((track) => ({
        ...track,
        mbArtistNames: album.mbArtists.map((artist) => artist.name).join(', '),
        mbAlbumName: album.mbAlbum.albumName,
        roonAlbumImageKey: album.roonAlbum.imageKey,
        roonAlbumItemKey: album.roonAlbum.itemKey,
      })),
    )
    .flat();

  return (
    <>
      <h1 className="heading-display">Tracks</h1>
      <div className="tracks-container">
        {tracks.map((track) => (
          <div key={track.mbTrackId}>
            <TrackRow track={track} />
          </div>
        ))}
      </div>
    </>
  );
}

export default Tracks;
