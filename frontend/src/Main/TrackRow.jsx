import PropTypes from 'prop-types';
import { useContext } from 'react';

import AppContext from '../AppContext';
import { formatMbTrackLength } from '../utils';

function TrackRow({ track }) {
  const { config, coreUrl, socketRef } = useContext(AppContext);

  return (
    <div className="track-row">
      <div className="track-row__number">{track.number}</div>
      <img
        src={`${coreUrl}/api/image/${track.roonAlbumImageKey}?scale=fit&width=75&height=75`}
        alt={track.name}
        className="track-row__image"
      />
      <div className="track-row__name">{track.name}</div>
      <div className="track-row__length">
        {formatMbTrackLength(track.length)}
      </div>
      <div className="track-row__artist">{track.mbArtistNames}</div>
      <div className="track-row__artist">{track.mbAlbumName}</div>
      <div className="track-row__track-add-next">
        <button
          type="button"
          onClick={() => {
            socketRef.current.emit('trackAddNext', {
              albumKey: track.roonAlbumItemKey,
              position: track.position,
              zoneId: config.selectedZoneId,
              mbTrackData: {
                mbTrackName: track.name,
                mbAlbumName: track.mbAlbumName,
                mbArtistNames: track.mbArtistNames,
                mbTrackId: track.mbTrackId,
                mbLength: track.length,
              },
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
    number: PropTypes.string.isRequired,
    position: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    length: PropTypes.number.isRequired,
    roonAlbumImageKey: PropTypes.string.isRequired,
    roonAlbumItemKey: PropTypes.string.isRequired,
    mbTrackId: PropTypes.string.isRequired,
    mbArtistNames: PropTypes.string.isRequired,
    mbAlbumName: PropTypes.string.isRequired,
  }).isRequired,
};

export default TrackRow;
