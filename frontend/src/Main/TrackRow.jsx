import PropTypes from 'prop-types';
import { useContext } from 'react';

import AppContext from '../AppContext';
import { formatRoonTrackLength } from '../utils';

function TrackRow({ track }) {
  const { config, coreUrl, socketRef } = useContext(AppContext);

  return (
    <div className="track-row">
      <img
        className="track-row__image"
        src={`${coreUrl}/api/image/${track.roonAlbumImageKey}?scale=fit&width=75&height=75`}
        alt={track.name}
      />
      <div className="track-row__number">{track.roonNumber}</div>
      <div className="track-row__track">
        <div className="track-row__name">{track.roonTrackName}</div>
        <div className="track-row__artist">{track.roonAlbumArtistName}</div>
        <div className="track-row__album">{track.roonAlbumName}</div>
      </div>
      <div className="track-row__length">
        {formatRoonTrackLength(track.roonLength)}
      </div>
      <div className="track-row__track-add-next">
        <button
          type="button"
          onClick={() => {
            socketRef.current.emit('trackAddNext', {
              albumKey: track.roonAlbumItemKey,
              roonPosition: track.roonPosition,
              zoneId: config.selectedZoneId,
            });
          }}
        >
          Play Next
        </button>
      </div>
    </div>
  );
}

TrackRow.propTypes = {
  track: PropTypes.shape({
    roonAlbumArtistName: PropTypes.string.isRequired,
    roonAlbumImageKey: PropTypes.string.isRequired,
    roonAlbumItemKey: PropTypes.string.isRequired,
    roonAlbumName: PropTypes.string.isRequired,
    roonLength: PropTypes.number,
    roonNumber: PropTypes.string.isRequired,
    roonPosition: PropTypes.number.isRequired,
    roonTrackName: PropTypes.string.isRequired,
  }).isRequired,
};

export default TrackRow;
