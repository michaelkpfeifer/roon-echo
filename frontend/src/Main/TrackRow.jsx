import PropTypes from 'prop-types';
import { useContext } from 'react';

import AppContext from '../AppContext';
import noAlbumArt from '../images/no-album-art.svg';

function TrackRow({ track }) {
  const { config, coreUrlRef, socketRef } = useContext(AppContext);
  const coreUrl = coreUrlRef.current;

  return (
    <div className="track-row">
      {track.image_key ? (
        <img
          src={`${coreUrl}/api/image/${track.image_key}?scale=fit&width=75&height=75`}
          alt={track.title}
          className="track-row__image"
        />
      ) : (
        <img src={noAlbumArt} alt={track.title} />
      )}
      <div className="track-row__name">
        <b>{track.title}</b>
      </div>
      <div className="track-row__artist">{track.subtitle}</div>
      <div className="track-row__track-add-next">
        <button
          type="button"
          onClick={() => {
            socketRef.current.emit('trackAddNext', {
              itemKey: track.item_key,
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
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    image_key: PropTypes.string,
    item_key: PropTypes.string,
  }).isRequired,
};

export default TrackRow;
