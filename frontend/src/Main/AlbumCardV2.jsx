import PropTypes from 'prop-types';
import { useContext } from 'react';

import AppContext from '../AppContext';
import noAlbumArt from '../images/no-album-art.svg';

function AlbumCardV2({ album }) {
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
      <div className="album-card__subtitle">{album.roonAlbum.albumArtist}</div>
    </div>
  );
}

AlbumCardV2.propTypes = {
  album: PropTypes.shape({
    status: PropTypes.oneOf(['roonAlbumLoaded']),
    roonAlbum: PropTypes.shape({
      title: PropTypes.string.isRequired,
      albumArtist: PropTypes.string.isRequired,
      itemKey: PropTypes.string.isRequired,
      imageKey: PropTypes.string,
    }),
    sortKeys: PropTypes.shape({
      artists: PropTypes.string.isRequired,
      releaseDate: PropTypes.string,
      title: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default AlbumCardV2;
