import { useContext } from 'react';

import type { RoonAlbum } from '../../../shared/internal/roonAlbum';
import type { RoonTrack } from '../../../shared/internal/roonTrack';
import AppContext from '../AppContext';
import { formatRoonTrackLength } from '../utils';

type MainTrackRowProps = {
  roonAlbum: RoonAlbum;
  roonTrack: RoonTrack;
};

function TrackRow({ roonAlbum, roonTrack }: MainTrackRowProps) {
  const { config, coreUrl, socketRef } = useContext(AppContext);

  const socket = socketRef.current;
  const zoneId = config.selectedZoneId;

  const addNextButton =
    socket === null || zoneId === null ? (
      <button type="button" disabled>
        Add Next
      </button>
    ) : (
      <button
        type="button"
        onClick={() => {
          socket.emit('trackAddNext', {
            albumKey: roonAlbum.itemKey,
            roonPosition: roonTrack.roonPosition,
            zoneId,
          });
        }}
      >
        Add Next
      </button>
    );

  return (
    <div className="track-row">
      {' '}
      <img
        className="track-row__image"
        src={`${coreUrl}/api/image/${roonAlbum.imageKey}?scale=fit&width=75&height=75`}
        alt={roonAlbum.roonAlbumName}
      />
      <div className="track-row__number">{roonTrack.roonNumber}</div>
      <div className="track-row__track">
        <div className="track-row__name">{roonTrack.roonTrackName}</div>
        <div className="track-row__artist">{roonAlbum.roonAlbumArtistName}</div>
        <div className="track-row__album">{roonAlbum.roonAlbumName}</div>
      </div>
      <div className="track-row__length">
        {formatRoonTrackLength(roonTrack.roonLength)}
      </div>
      <div className="track-row__track-add-next">{addNextButton}</div>
    </div>
  );
}

export default TrackRow;
