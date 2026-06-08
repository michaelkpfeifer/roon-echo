import { useContext } from 'react';
import { useParams } from 'react-router-dom';

import type { RoonAlbum } from '../../../shared/internal/roonAlbum';
import type { RoonTrack } from '../../../shared/internal/roonTrack';
import AppContext from '../AppContext';
import noAlbumArt from '../images/no-album-art.svg';
import { socket } from '../socket';
import { formatMbTrackLength, formatRoonTrackLength } from '../utils';
import AlbumArt from './AlbumArt';

function AlbumAggregateNotFound(id: string) {
  throw new Error(`Error: Cannot find album by ID ${id}.`);
}

function Album() {
  const { albumAggregates, config, coreUrl, setIsAlbumArtModalOpen } =
    useContext(AppContext);
  const { id } = useParams();

  const albumAggregate = albumAggregates.find((currentAlbumAggregate) => {
    if (
      currentAlbumAggregate.stage === 'empty' ||
      currentAlbumAggregate.stage === 'withRoonAlbum'
    ) {
      throw new Error(
        `Error: Unexpected albumAggregate stage: ${currentAlbumAggregate.stage}`,
      );
    }

    return currentAlbumAggregate.id === id;
  });

  if (id === null) {
    AlbumAggregateNotFound('null');
    return null;
  }

  if (id === undefined) {
    AlbumAggregateNotFound('undefined');
    return null;
  }

  if (albumAggregate === undefined) {
    AlbumAggregateNotFound(id);
    return null;
  }

  const formattedTrackLength = (roonTrack: RoonTrack, index: number) => {
    if (roonTrack.roonLength) {
      return formatRoonTrackLength(roonTrack.roonLength);
    }

    if (albumAggregate.stage === 'withMbMatch') {
      const mbTrack = albumAggregate.mbTracks[index];
      if (mbTrack.mbLength) {
        return formatMbTrackLength(mbTrack.mbLength);
      }
    }

    return '-';
  };

  const trackAddNext = (roonAlbum: RoonAlbum, roonPosition: number) => {
    if (config.selectedZoneId === null) {
      return null;
    }

    socket.emit('scheduleTrack', {
      roonAlbumName: roonAlbum.roonAlbumName,
      roonAlbumArtistName: roonAlbum.roonAlbumArtistName,
      roonPosition,
      how: 'Add Next',
      zoneId: config.selectedZoneId,
    });
  };

  const scheduleAlbum = (roonAlbum: RoonAlbum, how: string) => {
    if (config.selectedZoneId === null) {
      return null;
    }

    socket.emit('scheduleAlbum', {
      roonAlbumName: roonAlbum.roonAlbumName,
      roonAlbumArtistName: roonAlbum.roonAlbumArtistName,
      how,
      zoneId: config.selectedZoneId,
    });
  };

  switch (albumAggregate.stage) {
    case 'empty':
      throw new Error(
        `Error: Unexpected albumAggregate stage: ${albumAggregate.stage}`,
      );

    case 'withRoonAlbum':
      throw new Error(
        `Error: Unexpected albumAggregate stage: ${albumAggregate.stage}`,
      );

    case 'withMbMatch':
    case 'withoutMbMatch': {
      const { roonAlbum } = albumAggregate;
      const { roonAlbumName, roonAlbumArtistName, imageKey } = roonAlbum;

      return (
        <>
          <AlbumArt
            imageKey={imageKey}
            alt={`${roonAlbumArtistName} - ${roonAlbumName}`}
          />
          <div className="album-heading">
            <button
              type="button"
              className="album-heading__image-button"
              onClick={() => setIsAlbumArtModalOpen(true)}
            >
              {imageKey ? (
                <img
                  src={`${coreUrl}/api/image/${imageKey}?scale=fit&width=250&height=250`}
                  alt={roonAlbumName}
                  className="album-heading__image"
                />
              ) : (
                <img
                  src={noAlbumArt}
                  alt={roonAlbumName}
                  className="album-heading__image"
                />
              )}
            </button>
            <div>
              <div className="album-heading__artists">
                {roonAlbumArtistName}
              </div>
              <div className="album-heading__name">{roonAlbumName}</div>
              <div className="album-actions">
                <button
                  type="button"
                  disabled={config.selectedZoneId === null}
                  className="album-actions__action"
                  onClick={() =>
                    scheduleAlbum(albumAggregate.roonAlbum, 'Add Next')
                  }
                >
                  Add Next
                </button>
                <button
                  type="button"
                  disabled={config.selectedZoneId === null}
                  className="album-actions__action"
                  onClick={() =>
                    scheduleAlbum(albumAggregate.roonAlbum, 'Queue')
                  }
                >
                  Queue
                </button>
              </div>
            </div>
          </div>

          {albumAggregate.roonTracks.map((roonTrack, index) => (
            <div key={roonTrack.trackId} className="album-track-row">
              <div className="album-track-row__number">
                {roonTrack.roonNumber}
              </div>
              <div className="album-track-row__name">
                {roonTrack.roonTrackName}
              </div>
              <div className="album-track-row__length">
                {formattedTrackLength(roonTrack, index)}
              </div>
              <div className="album-track-row__track-action">
                <button
                  type="button"
                  disabled={config.selectedZoneId === null}
                  onClick={() => {
                    trackAddNext(
                      albumAggregate.roonAlbum,
                      roonTrack.roonPosition,
                    );
                  }}
                >
                  Add Next
                </button>
              </div>
            </div>
          ))}
        </>
      );
    }
  }
}

export default Album;
