import { Ban, Check, CopyCheck } from 'lucide-react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

import type { AlbumAggregate } from '../../../shared/internal/albumAggregate';
import AppContext from '../AppContext';
import noAlbumArt from '../images/no-album-art.svg';

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

const albumArt = (
  coreUrl: string | null,
  albumAggregate: Extract<
    AlbumAggregate,
    { stage: 'withRoonTracks' | 'withMbMatch' | 'withoutMbMatch' }
  >,
) => {
  return albumAggregate.roonAlbum.imageKey ? (
    <img
      src={`${coreUrl}/api/image/${albumAggregate.roonAlbum.imageKey}?scale=fit&width=150&height=150`}
      alt={albumAggregate.roonAlbum.roonAlbumName}
      className="album-card__image"
    />
  ) : (
    <img
      src={noAlbumArt}
      alt={albumAggregate.roonAlbum.roonAlbumName}
      className="album-card__image"
    />
  );
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
  handlePointerDown: (
    e: React.PointerEvent<HTMLDivElement>,
    albumaggregate: AlbumAggregate,
  ) => void;
};

function AlbumAggregateWithRoonTracks({
  albumAggregate,
  handlePointerDown,
}: AlbumAggregateWithRoonTracksProps) {
  const { coreUrl } = useContext(AppContext);

  return (
    <div
      className="album-card"
      onPointerDown={(e) => handlePointerDown(e, albumAggregate)}
    >
      <Link to={`/albums/${albumAggregate.id}`}>
        {albumArt(coreUrl, albumAggregate)}
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
  handlePointerDown: (
    e: React.PointerEvent<HTMLDivElement>,
    albumaggregate: AlbumAggregate,
  ) => void;
};

function AlbumAggregateWithMbMatch({
  albumAggregate,
  handlePointerDown,
}: AlbumAggregateWithMbMatchProps) {
  const { coreUrl } = useContext(AppContext);

  return (
    <div
      className="album-card"
      onPointerDown={(e) => handlePointerDown(e, albumAggregate)}
    >
      <Link to={`/albums/${albumAggregate.id}`}>
        {albumArt(coreUrl, albumAggregate)}
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
  handlePointerDown: (
    e: React.PointerEvent<HTMLDivElement>,
    albumaggregate: AlbumAggregate,
  ) => void;
};

function AlbumAggregateWithoutMbMatch({
  albumAggregate,
  handlePointerDown,
}: AlbumAggregateWithoutMbMatchProps) {
  const { coreUrl } = useContext(AppContext);

  return (
    <div
      className="album-card"
      onPointerDown={(e) => handlePointerDown(e, albumAggregate)}
    >
      <Link to={`/albums/${albumAggregate.id}`}>
        {albumArt(coreUrl, albumAggregate)}
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
  handlePointerDown: (
    e: React.PointerEvent<HTMLDivElement>,
    albumAggregate: AlbumAggregate,
  ) => void;
};

function AlbumCard({ albumAggregate, handlePointerDown }: AlbumCardProps) {
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
      return (
        <AlbumAggregateWithRoonTracks
          albumAggregate={albumAggregate}
          handlePointerDown={handlePointerDown}
        />
      );

    case 'withMbMatch':
      return (
        <AlbumAggregateWithMbMatch
          albumAggregate={albumAggregate}
          handlePointerDown={handlePointerDown}
        />
      );

    case 'withoutMbMatch':
      return (
        <AlbumAggregateWithoutMbMatch
          albumAggregate={albumAggregate}
          handlePointerDown={handlePointerDown}
        />
      );
  }
}

export default AlbumCard;
