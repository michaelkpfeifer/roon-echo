import PropTypes from 'prop-types';
import { useContext } from 'react';

import AppContext from '../AppContext';
import noArtistImage from '../images/no-artist-image.svg';

function ArtistCard({ artist }) {
  const { coreUrlRef } = useContext(AppContext);
  const coreUrl = coreUrlRef.current;

  return (
    <div className="artist-card">
      <img
        src={`${coreUrl}/api/image/${artist.image_key}?scale=fit&width=150&height=150`}
        alt={artist.title}
        className="artist-card__image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = noArtistImage;
        }}
      />
      <div className="artist-card__title">
        <b>{artist.title}</b>
      </div>
      <div className="artist-card__subtitle">{artist.subtitle}</div>
    </div>
  );
}

ArtistCard.propTypes = {
  artist: PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    image_key: PropTypes.string.isRequired,
  }).isRequired,
};

export default ArtistCard;
