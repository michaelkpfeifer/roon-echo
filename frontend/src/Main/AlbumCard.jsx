import PropTypes from 'prop-types';
import { useContext } from 'react';

import AppContext from '../AppContext';
import noAlbumArt from '../images/no-album-art.svg';

function AlbumCard({ album }) {
  const { coreUrlRef } = useContext(AppContext);
  const coreUrl = coreUrlRef.current;

  return (
    <div className="album-card">
      <div>{album.status}</div>
      {album.roonAlbum.imageKey ? (
        <img
          src={`${coreUrl}/api/image/${album.roonAlbum.imageKey}?scale=fit&width=150&height=150`}
          alt={album.roonAlbum.title}
          className="album-card__image"
        />
      ) : (
        <img
          src={noAlbumArt}
          alt={album.roonAlbum.title}
          className="album-card__image"
        />
      )}
      <div className="album-card__title">
        <b>{album.roonAlbum.title}</b>
      </div>
      <div className="album-card__subtitle">{album.roonAlbum.subtitle}</div>
    </div>
  );
}

AlbumCard.propTypes = {
  album: PropTypes.shape({
    status: PropTypes.oneOf([
      'unknownArtistOrTitle',
      'mbDataLoaded',
      'roonAlbumTracksAdded',
    ]).isRequired,
    roonAlbum: PropTypes.shape({
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string.isRequired,
      imageKey: PropTypes.string,
      itemKey: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default AlbumCard;
