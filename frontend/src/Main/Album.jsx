import { useContext } from 'react';
import { useParams } from 'react-router-dom';

import AppContext from '../AppContext';
import noAlbumArt from '../images/no-album-art.svg';
import { formatMbTrackLength } from '../utils';

function Album() {
  const { appState, config, coreUrlRef, socketRef } = useContext(AppContext);
  const coreUrl = coreUrlRef.current;

  const { mbAlbumId } = useParams();

  const album = appState.albums.find(
    (a) => a.mbAlbum && a.mbAlbum.mbAlbumId === mbAlbumId,
  );

  return (
    <>
      <div className="album-heading">
        {album.roonAlbum.imageKey ? (
          <img
            src={`${coreUrl}/api/image/${album.roonAlbum.imageKey}?scale=fit&width=150&height=150`}
            alt={album.mbAlbum.mbAlbumName}
            className="album-heading__image"
          />
        ) : (
          <img src={noAlbumArt} alt={album.mbAlbum.mbAlbumName} />
        )}
        <div>
          <div className="album-heading__artists">
            {album.mbArtists.map((artist) => artist.name).join(', ')}
          </div>
          <div className="album-heading__name">{album.mbAlbum.albumName}</div>
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
                socketRef.current.emit('trackAddNext', {
                  albumKey: album.roonAlbum.itemKey,
                  position: track.position,
                  zoneId: config.selectedZoneId,
                });
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
