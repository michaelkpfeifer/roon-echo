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
      {album.roonData.imageKey ? (
        <img
          src={`${coreUrl}/api/image/${album.roonData.imageKey}?scale=fit&width=150&height=150`}
          alt={album.roonData.albumTitle}
          className="album-card__image"
        />
      ) : (
        <img
          src={noAlbumArt}
          alt={album.roonData.albumTitle}
          className="album-card__image"
        />
      )}
      <div className="album-card__title">
        <b>{album.roonData.albumTitle}</b>
      </div>
      <div className="album-card__subtitle">{album.roonData.albumArtist}</div>
    </div>
  );
}

AlbumCardV2.propTypes = {
  album: PropTypes.shape({
    status: PropTypes.oneOf(['roonAlbumLoaded']),
    roonData: PropTypes.shape({
      albumTitle: PropTypes.string.isRequired,
      albumArtist: PropTypes.string.isRequired,
      itemKey: PropTypes.string.isRequired,
      imageKey: PropTypes.string,
    }),
    sortKeys: PropTypes.shape({
      albumArtist: PropTypes.string.isRequired,
      releaseDate: PropTypes.string,
      albumTitle: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default AlbumCardV2;
