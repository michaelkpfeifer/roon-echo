import { memo, useContext } from 'react';

import type { RoonAlbum } from '../../../shared/internal/roonAlbum';
import type { RoonTrack } from '../../../shared/internal/roonTrack';
import AppContext from '../AppContext';
import { socket } from '../socket';
import { formatRoonTrackLength } from '../utils';
import noAlbumArt from '../images/no-album-art.svg';

type MainTrackRowProps = {
  roonAlbum: RoonAlbum;
  roonTrack: RoonTrack;
};


const TrackRow = memo(function TrackRow({ roonAlbum, roonTrack }: MainTrackRowProps) {
  const { config, coreUrl } = useContext(AppContext);

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
          socket.emit('scheduleTrack', {
            roonAlbumName: roonAlbum.roonAlbumName,
            roonAlbumArtistName: roonAlbum.roonAlbumArtistName,
            roonPosition: roonTrack.roonPosition,
            how: 'Add Next',
            zoneId,
          });
        }}
      >
        Add Next
      </button>
    );

  const queueButton =
    socket === null || zoneId === null ? (
      <button type="button" disabled>
        Queue
      </button>
    ) : (
      <button
        type="button"
        onClick={() => {
          socket.emit('scheduleTrack', {
            roonAlbumName: roonAlbum.roonAlbumName,
            roonAlbumArtistName: roonAlbum.roonAlbumArtistName,
            roonPosition: roonTrack.roonPosition,
            how: 'Queue',
            zoneId,
          });
        }}
      >
        Queue
      </button>
    );

  return (
    <div className="track-row">
      {roonAlbum.imageKey ? (
        <img
          src={`${coreUrl}/api/image/${roonAlbum.imageKey}?scale=fit&width=60&height=60`}
          alt={roonAlbum.roonAlbumName}
          className="track-row__image"
        />
      ) : (
        <img
          src={noAlbumArt}
          alt={roonAlbum.roonAlbumName}
          className="track-row__image"
        />
      )}
      <div className="track-row__number">{roonTrack.roonNumber}</div>
      <div className="track-row__track">
        <div className="track-row__name">{roonTrack.roonTrackName}</div>
        <div className="track-row__artist">{roonAlbum.roonAlbumArtistName}</div>
        <div className="track-row__album">{roonAlbum.roonAlbumName}</div>
      </div>
      <div className="track-row__length">
        {formatRoonTrackLength(roonTrack.roonLength)}
      </div>
      <div className="track-row__track-action">{addNextButton}</div>
      <div className="track-row__track-action">{queueButton}</div>
    </div>
  );
})

export default TrackRow;
