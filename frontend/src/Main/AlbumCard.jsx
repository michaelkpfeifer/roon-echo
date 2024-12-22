import PropTypes from 'prop-types';
import { useContext } from 'react';

import AppContext from '../AppContext';
import noAlbumArt from '../images/no-album-art.svg';
import { setSelectedScreen } from '../utils';

function AlbumCard({ album }) {
  const { coreUrlRef, setAppState, socketRef } = useContext(AppContext);
  const coreUrl = coreUrlRef.current;

  return (
    <div className="album-card">
      <button
        type="button"
        onClick={() => {
          setAppState((currentAppState) =>
            setSelectedScreen(currentAppState, 'album'),
          );
          socketRef.current.emit('album', { itemKey: album.item_key });
        }}
      >
        {album.image_key ? (
          <img
            src={`${coreUrl}/api/image/${album.image_key}?scale=fit&width=150&height=150`}
            alt={album.title}
            className="album-card__image"
          />
        ) : (
          <img
            src={noAlbumArt}
            alt={album.title}
            className="album-card__image"
          />
        )}
      </button>
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
    image_key: PropTypes.string,
    item_key: PropTypes.string,
  }).isRequired,
};

export default AlbumCard;
