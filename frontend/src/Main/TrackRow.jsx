import PropTypes from 'prop-types';
import { useContext } from 'react';

import AppContext from '../AppContext';
import noAlbumArt from '../images/no-album-art.svg';

function TrackRow({ track }) {
  const { coreUrlRef } = useContext(AppContext);
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
    </div>
  );
}

TrackRow.propTypes = {
  track: PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    image_key: PropTypes.string,
  }).isRequired,
};

export default TrackRow;

// hint: 'action_list';
// image_key: 'dc7f2533fb475c3d3e80fce4ef7b2294';
// item_key: '357:61';
// subtitle: 'Sigur Rós, Kjartan Sveinsson, Orri Páll Dýrason, Georg Hólm, Jón Þór Birgisson';
// title: '[Fyrsta]';
