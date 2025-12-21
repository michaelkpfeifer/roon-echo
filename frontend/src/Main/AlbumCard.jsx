import { Ban, Check, CopyCheck } from 'lucide-react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

import AppContext from '../AppContext';

const albumStageIcon = (stage) => {
  let Icon;
  switch (stage) {
    case 'withMbMatch':
      Icon = Check;
      break;
    case 'withoutMbMatch':
      Icon = CopyCheck;
      break;
    case 'withRoonTracks':
      Icon = Ban;
      break;
    default:
      throw new Error(`Error: Unexpected albumAggregate stage: ${stage}`);
  }

  return Icon;
};

const imageLinkTarget = (albumAggregate) => {
  let linkTarget;

  switch (albumAggregate.stage) {
    case 'withMbMatch':
      linkTarget = `/albums/${albumAggregate.mbAlbum.mbAlbumId}`;
      break;
    case 'withoutMbMatch':
      linkTarget = '';
      break;
    case 'withRoonTracks':
      linkTarget = '';
      break;
    default:
      throw new Error(
        `Error: Unexpected albumAggregate stage: ${albumAggregate.stage}`,
      );
  }

  return linkTarget;
};

function AlbumData({ stage, albumName, artistName }) {
  const Icon = albumStageIcon(stage);

  return (
    <>
      <div className="album-card__album-name">
        <Icon className="album-card__stage-icon" />
        &nbsp;
        <b>{albumName}</b>
      </div>
      <div className="album-card__artist-name">{artistName}</div>
    </>
  );
}

function AlbumCard({ albumAggregate }) {
  const { coreUrlRef } = useContext(AppContext);
  const coreUrl = coreUrlRef.current;

  return (
    <div className="album-card">
      <Link to={imageLinkTarget(albumAggregate)}>
        <img
          src={`${coreUrl}/api/image/${albumAggregate.roonAlbum.imageKey}?scale=fit&width=150&height=150`}
          alt={albumAggregate.roonAlbum.albumName}
          className="album-card__image"
        />
      </Link>

      <AlbumData
        stage={albumAggregate.stage}
        albumName={albumAggregate.roonAlbum.albumName}
        artistName={albumAggregate.roonAlbum.artistName}
      />
    </div>
  );
}

export default AlbumCard;
