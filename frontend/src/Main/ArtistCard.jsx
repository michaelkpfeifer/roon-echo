import PropTypes from 'prop-types';

function ArtistCard({ artist }) {
  return (
    <div className="artist-card">
      <div className="artist-card__name">{artist.name}</div>
    </div>
  );
}

ArtistCard.propTypes = {
  artist: PropTypes.shape({
    mbArtistId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    sortName: PropTypes.string.isRequired,
  }).isRequired,
};

export default ArtistCard;
