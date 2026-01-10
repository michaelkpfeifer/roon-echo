import { useContext } from 'react';
import { useParams } from 'react-router-dom';

import AppContext from '../AppContext';
import { formatMbTrackLength } from '../utils';

function Album() {
  const { appState, config, coreUrl, socketRef } = useContext(AppContext);

  const { mbAlbumId } = useParams();

  const album = appState.albums.find(
    (a) => a.mbAlbum && a.mbAlbum.mbAlbumId === mbAlbumId,
  );

  const { mbArtists, roonAlbum } = album;
  const { albumName, imageKey } = roonAlbum;
  const artistNames = mbArtists.map((artist) => artist.name).join(', ');

  const enqueueTrackNext = (track) => {
    socketRef.current.emit('trackAddNext', {
      albumKey: album.roonAlbum.itemKey,
      position: track.position,
      zoneId: config.selectedZoneId,
      mbTrackData: {
        mbTrackName: track.name,
        mbAlbumName: albumName,
        mbArtistNames: artistNames,
        mbTrackId: track.mbTrackId,
        mbLength: track.length,
        roonAlbumId: album.roonAlbum.roonAlbumId,
      },
    });
  };

  const enqueueAlbumNext = (album) => {
    album.mbTracks.forEach((track) => enqueueTrackNext(track));
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
          <div className="album-heading__artists">{artistNames}</div>
          <div className="album-heading__name">{albumName}</div>
          <div className="album-actions">
            <button type="button" onClick={() => enqueueAlbumNext(album)}>
              Play Next
            </button>
          </div>
        </div>
      </div>

      {album.mbTracks.map((track) => (
        <div key={track.mbTrackId} className="album-track-row">
          <div className="album-track-row__number">{track.number}</div>
          <div className="album-track-row__name">{track.name}</div>
          <div className="album-track-row__length">
            {formatMbTrackLength(track.length)}
          </div>
          <div className="album-track-row__track-add-next">
            <button
              type="button"
              onClick={() => {
                enqueueTrackNext(track);
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
