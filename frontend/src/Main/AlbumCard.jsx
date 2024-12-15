import PropTypes from 'prop-types';
import { useContext } from 'react';

import AppContext from '../AppContext';

function AlbumCard({ album }) {
  const { coreUrlRef } = useContext(AppContext);
  const coreUrl = coreUrlRef.current;

  return (
    <div className="album-card">
      <img
        src={`${coreUrl}/api/image/${album.image_key}?scale=fit&width=216&height=216`}
        alt={album.title}
        className="album-card__image"
      />
      <div className="album-card__title">
        <b>{album.title}</b>
      </div>
      <div className="album-card__subtitle">{album.subtitle}</div>
    </div>
  );
}

AlbumCard.propTypes = {
  album: PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    image_key: PropTypes.string.isRequired,
  }).isRequired,
};

export default AlbumCard;
