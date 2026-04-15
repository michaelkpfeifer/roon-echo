import { Ban, Check, CopyCheck } from 'lucide-react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

import type { AlbumAggregate } from '../../../shared/internal/albumAggregate';
import AppContext from '../AppContext';

const albumStageIcon = (stage: string) => {
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

type AlbumDataProps = {
  stage: string;
  roonAlbumName: string;
  roonAlbumArtistName: string;
};

function AlbumData({
  stage,
  roonAlbumName,
  roonAlbumArtistName,
}: AlbumDataProps) {
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

type AlbumAggregateWithRoonTracksProps = {
  albumAggregate: Extract<AlbumAggregate, { stage: 'withRoonTracks' }>;
};

function AlbumAggregateWithRoonTracks({
  albumAggregate,
}: AlbumAggregateWithRoonTracksProps) {
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

type AlbumAggregateWithMbMatchProps = {
  albumAggregate: Extract<AlbumAggregate, { stage: 'withMbMatch' }>;
};

function AlbumAggregateWithMbMatch({
  albumAggregate,
}: AlbumAggregateWithMbMatchProps) {
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

type AlbumAggregateWithoutMbMatchProps = {
  albumAggregate: Extract<AlbumAggregate, { stage: 'withoutMbMatch' }>;
};

function AlbumAggregateWithoutMbMatch({
  albumAggregate,
}: AlbumAggregateWithoutMbMatchProps) {
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

type AlbumCardProps = {
  albumAggregate: AlbumAggregate;
};

function AlbumCard({ albumAggregate }: AlbumCardProps) {
  switch (albumAggregate.stage) {
    case 'empty':
      throw new Error(
        `Error: Unexpected albumAggregate stage: ${albumAggregate.stage}`,
      );

    case 'withRoonAlbum':
      throw new Error(
        `Error: Unexpected albumAggregate stage: ${albumAggregate.stage}`,
      );

    case 'withRoonTracks':
      return <AlbumAggregateWithRoonTracks albumAggregate={albumAggregate} />;

    case 'withMbMatch':
      return <AlbumAggregateWithMbMatch albumAggregate={albumAggregate} />;

    case 'withoutMbMatch':
      return <AlbumAggregateWithoutMbMatch albumAggregate={albumAggregate} />;
  }
}

export default AlbumCard;
