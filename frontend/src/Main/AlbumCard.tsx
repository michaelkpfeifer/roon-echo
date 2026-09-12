import clsx from 'clsx';
import { Ban, Check, CopyCheck } from 'lucide-react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

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
  handlePointerUp: () => void;
  handleSelection: (
    albumAggregate: Extract<
      AlbumAggregate,
      { stage: 'withRoonTracks' | 'withMbMatch' | 'withoutMbMatch' }
    >,
  ) => void;
  isSelected: boolean;
  longPressFiredRef: React.RefObject<boolean>;
  selectionMode: boolean;
};

function AlbumAggregateWithRoonTracks({
  albumAggregate,
  handlePointerDown,
  handlePointerUp,
  handleSelection,
  isSelected,
  longPressFiredRef,
  selectionMode,
}: AlbumAggregateWithRoonTracksProps) {
  const { coreUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }

    if (selectionMode) {
      handleSelection(albumAggregate);
      return;
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={clsx('album-card', { 'album-card--selected': isSelected })}
      onPointerDown={(e) => handlePointerDown(e, albumAggregate)}
      onPointerUp={() => handlePointerUp()}
      onClick={handleClick}
    >
      {albumArt(coreUrl, albumAggregate)}
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
  handlePointerUp: () => void;
  handleSelection: (
    albumAggregate: Extract<
      AlbumAggregate,
      { stage: 'withRoonTracks' | 'withMbMatch' | 'withoutMbMatch' }
    >,
  ) => void;
  isSelected: boolean;
  longPressFiredRef: React.RefObject<boolean>;
  selectionMode: boolean;
};
function AlbumAggregateWithMbMatch({
  albumAggregate,
  handlePointerDown,
  handlePointerUp,
  handleSelection,
  isSelected,
  longPressFiredRef,
  selectionMode,
}: AlbumAggregateWithMbMatchProps) {
  const { coreUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }

    if (selectionMode) {
      handleSelection(albumAggregate);
      return;
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={clsx('album-card', { 'album-card--selected': isSelected })}
      onPointerDown={(e) => handlePointerDown(e, albumAggregate)}
      onPointerUp={() => handlePointerUp()}
      onClick={handleClick}
    >
      {albumArt(coreUrl, albumAggregate)}
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
  handlePointerUp: () => void;
  handleSelection: (
    albumAggregate: Extract<
      AlbumAggregate,
      { stage: 'withRoonTracks' | 'withMbMatch' | 'withoutMbMatch' }
    >,
  ) => void;
  isSelected: boolean;
  longPressFiredRef: React.RefObject<boolean>;
  selectionMode: boolean;
};

function AlbumAggregateWithoutMbMatch({
  albumAggregate,
  handlePointerDown,
  handlePointerUp,
  handleSelection,
  isSelected,
  longPressFiredRef,
  selectionMode,
}: AlbumAggregateWithoutMbMatchProps) {
  const { coreUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }

    if (selectionMode) {
      handleSelection(albumAggregate);
      return;
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={clsx('album-card', { 'album-card--selected': isSelected })}
      onPointerDown={(e) => handlePointerDown(e, albumAggregate)}
      onPointerUp={() => handlePointerUp()}
      onClick={handleClick}
    >
      {albumArt(coreUrl, albumAggregate)}
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
  handlePointerUp: () => void;
  handleSelection: (
    albumAggregate: Extract<
      AlbumAggregate,
      { stage: 'withRoonTracks' | 'withMbMatch' | 'withoutMbMatch' }
    >,
  ) => void;
  isSelected: boolean;
  longPressFiredRef: React.RefObject<boolean>;
  selectionMode: boolean;
};

function AlbumCard({
  albumAggregate,
  handlePointerDown,
  handlePointerUp,
  handleSelection,
  isSelected,
  longPressFiredRef,
  selectionMode,
}: AlbumCardProps) {
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
          handlePointerUp={handlePointerUp}
          handleSelection={handleSelection}
          isSelected={isSelected}
          longPressFiredRef={longPressFiredRef}
          selectionMode={selectionMode}
        />
      );

    case 'withMbMatch':
      return (
        <AlbumAggregateWithMbMatch
          albumAggregate={albumAggregate}
          handlePointerDown={handlePointerDown}
          handlePointerUp={handlePointerUp}
          handleSelection={handleSelection}
          isSelected={isSelected}
          longPressFiredRef={longPressFiredRef}
          selectionMode={selectionMode}
        />
      );

    case 'withoutMbMatch':
      return (
        <AlbumAggregateWithoutMbMatch
          albumAggregate={albumAggregate}
          handlePointerDown={handlePointerDown}
          handlePointerUp={handlePointerUp}
          handleSelection={handleSelection}
          isSelected={isSelected}
          longPressFiredRef={longPressFiredRef}
          selectionMode={selectionMode}
        />
      );
  }
}

export default AlbumCard;
