import fp from 'lodash/fp';
import { Ban, Check, CopyCheck, RectangleEllipsis } from 'lucide-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

import AppContext from '../AppContext';
import noAlbumArt from '../images/no-album-art.svg';

const albumStatusIcon = (status) => {
  let Icon;
  switch (status) {
    case 'albumMatched':
      Icon = Check;
      break;
    case 'noAlbumMatchFound':
      Icon = CopyCheck;
      break;
    case 'roonAlbumLoaded':
      Icon = Ban;
      break;
    case 'candidatesLoaded':
      Icon = RectangleEllipsis;
      break;
    default:
      throw new Error(`Error: Unknown album status: ${status}`);
  }

  return Icon;
};

function AlbumData({ status, albumName, artistName }) {
  const Icon = albumStatusIcon(status);

  return (
    <>
      <div className="album-card__album-name">
        <Icon className="album-card__status-icon" />
        &nbsp;
        <b>{albumName}</b>
      </div>
      <div className="album-card__artist-name">{artistName}</div>
    </>
  );
}

function AlbumCard({ album }) {
  const { coreUrlRef } = useContext(AppContext);
  const coreUrl = coreUrlRef.current;

  return (
    <div className="album-card">
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
      <AlbumData
        status={album.status}
        albumName={album.roonAlbum.albumName}
        artistName={album.roonAlbum.artistName}
      />
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
      mbAlbumId: PropTypes.string,
    }),
  }).isRequired,
};

export default AlbumCard;
