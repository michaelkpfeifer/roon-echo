import fp from 'lodash/fp';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

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
      <div className="album-card__title">
        <b>{album.roonAlbum.albumName}</b>
      </div>
      <div className="album-card__subtitle">{album.roonAlbum.artistName}</div>
      {!fp.isEmpty(album.mbAlbum) ? (
        <Link to={`/albums/${album.mbAlbum.mbAlbumId}`}>View Details</Link>
      ) : null}
    </div>
  );
}

AlbumCard.propTypes = {
  album: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.oneOf([
      'albumMatched',
      'candidatesLoaded',
      'noAlbumMatchFound',
      'roonAlbumLoaded',
    ]),
    sortKeys: PropTypes.shape({
      artistNames: PropTypes.string.isRequired,
      releaseDate: PropTypes.string,
      albumName: PropTypes.string.isRequired,
    }),
    roonAlbum: PropTypes.shape({
      albumName: PropTypes.string.isRequired,
      artistName: PropTypes.string.isRequired,
      itemKey: PropTypes.string.isRequired,
      imageKey: PropTypes.string,
    }),
    mbAlbum: PropTypes.shape({
      mbAlbumId: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default AlbumCard;
