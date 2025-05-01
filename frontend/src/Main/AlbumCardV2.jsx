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
          alt={album.roonAlbum.albumName}
          className="album-card__image"
        />
      ) : (
        <img
          src={noAlbumArt}
          alt={album.roonAlbum.albumName}
          className="album-card__image"
        />
      )}
      <div className="album-card__albumName">
        <b>{album.roonAlbum.albumName}</b>
      </div>
      <div className="album-card__subalbumName">
        {album.roonAlbum.artistName}
      </div>
    </div>
  );
}

AlbumCardV2.propTypes = {
  album: PropTypes.shape({
    status: PropTypes.oneOf(['candidatesLoaded', 'roonAlbumLoaded']),
    roonAlbum: PropTypes.shape({
      albumName: PropTypes.string.isRequired,
      artistName: PropTypes.string.isRequired,
      itemKey: PropTypes.string.isRequired,
      imageKey: PropTypes.string,
    }),
    sortKeys: PropTypes.shape({
      artistNames: PropTypes.string.isRequired,
      releaseDate: PropTypes.string,
      albumName: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default AlbumCardV2;
