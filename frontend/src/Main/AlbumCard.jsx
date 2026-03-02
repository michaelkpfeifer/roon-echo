import { Ban, Check, CopyCheck } from 'lucide-react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

import AppContext from '../AppContext';

const albumStageIcon = (stage) => {
  let Icon;
  switch (stage) {
    case 'withMbMatch':
      Icon = <Check className="album-card__stage-icon" />;
      break;
    case 'withoutMbMatch':
      Icon = <CopyCheck className="album-card__stage-icon" />;
      break;
    case 'withRoonTracks':
      Icon = <Ban className="album-card__stage-icon" />;
      break;
    default:
      throw new Error(`Error: Unexpected albumAggregate stage: ${stage}`);
  }

  return Icon;
};

function AlbumData({ stage, roonAlbumName, roonAlbumArtistName }) {
  const Icon = albumStageIcon(stage);

  return (
    <>
      <div className="album-card__album-name">
        {Icon}
        &nbsp;
        <b>{roonAlbumName}</b>
      </div>
      <div className="album-card__artist-name">{roonAlbumArtistName}</div>
    </>
  );
}

function AlbumCard({ albumAggregate }) {
  const { coreUrl } = useContext(AppContext);

  return (
    <div className="album-card">
      <Link to={`/albums/${albumAggregate.id}`}>
        <img
          src={`${coreUrl}/api/image/${albumAggregate.roonAlbum.imageKey}?scale=fit&width=150&height=150`}
          alt={albumAggregate.roonAlbum.roonAlbumName}
          className="album-card__image"
        />
      </Link>

      <AlbumData
        stage={albumAggregate.stage}
        roonAlbumName={albumAggregate.roonAlbum.roonAlbumName}
        roonAlbumArtistName={albumAggregate.roonAlbum.roonAlbumArtistName}
      />
    </div>
  );
}

export default AlbumCard;
