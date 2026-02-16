import { useContext } from 'react';
import { useParams } from 'react-router-dom';

import AppContext from '../AppContext';
import { formatMbTrackLength, formatRoonTrackLength } from '../utils';

function Album() {
  const { appState, config, coreUrl, socketRef } = useContext(AppContext);
  const { id } = useParams();

  const album = appState.albums.find(
    (currentAlbumAggregate) => currentAlbumAggregate.id === id,
  );

  const { roonAlbum } = album;
  const { albumName, artistName: roonAlbumArtistName, imageKey } = roonAlbum;

  const enqueueTrackNext = (track) => {
    socketRef.current.emit('trackAddNext', {
      albumKey: album.roonAlbum.itemKey,
      position: track.position,
      zoneId: config.selectedZoneId,
    });
  };

  const enqueueAlbumNext = (album) => {
    socketRef.current.emit('albumAddNext', {
      roonAlbum: album.roonAlbum,
      zoneId: config.selectedZoneId,
    });
  };

  const formattedTrackLength = (roonTrack, index) => {
    if (roonTrack.length) {
      return formatRoonTrackLength(roonTrack.length);
    }

    if (album.stage === 'withMbMatch') {
      const mbTrack = album.mbTracks[index];
      if (mbTrack.length) {
        return formatMbTrackLength(mbTrack.length);
      }
    }

    return '-';
  };

  return (
    <>
      <div className="album-heading">
        <img
          src={`${coreUrl}/api/image/${imageKey}?scale=fit&width=150&height=150`}
          alt={albumName}
          className="album-heading__image"
        />
        <div>
          <div className="album-heading__artists">{roonAlbumArtistName}</div>
          <div className="album-heading__name">{albumName}</div>
          <div className="album-actions">
            <button
              type="button"
              className="album-actions__play-next"
              onClick={() => enqueueAlbumNext(album)}
            >
              Play Next
            </button>
          </div>
        </div>
      </div>

      {album.roonTracks.map((roonTrack, index) => (
        <div key={roonTrack.roonTrackId} className="album-track-row">
          <div className="album-track-row__number">{roonTrack.number}</div>
          <div className="album-track-row__name">{roonTrack.trackName}</div>
          <div className="album-track-row__length">
            {formattedTrackLength(roonTrack, index)}
          </div>
          <div className="album-track-row__track-add-next">
            <button
              type="button"
              onClick={() => {
                enqueueTrackNext(roonTrack);
              }}
            >
              Play Next
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

export default Album;
