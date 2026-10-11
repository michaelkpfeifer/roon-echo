import fp from 'lodash/fp';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { socket } from './socket';
import { mergeQueues } from './utils';
import type { RoonQueueItem } from '../../shared/internal/roonQueueItem';
import type { Zone } from '../../shared/internal/zone';
import type { ZoneSeekPosition } from '../../shared/internal/zoneSeekPosition';

type PlaybackContextType = {
  zones: Record<string, Zone>;
  queues: Record<string, RoonQueueItem[]>;
};

const PlaybackContext = createContext<PlaybackContextType | null>(null);

function usePlayback() {
  const value = useContext(PlaybackContext);
  if (!value)
    throw new Error('usePlayback must be used inside PlaybackProvider');
  return value;
}

function PlaybackProvider({ children }: { children: ReactNode }) {
  const [zones, setZones] = useState<Record<string, Zone>>({});
  const [queues, setQueues] = useState<Record<string, RoonQueueItem[]>>({});

  useEffect(() => {
    const handleInitialStateMessage = (initialState: {
      zones: Record<string, Zone>;
    }) => {
      setZones(initialState.zones);
    };

    const handleZonesSeekChangedMessage = (
      zonesSeekChangedMessage: Record<string, ZoneSeekPosition>,
    ) => {
      setZones((currentZones) =>
        Object.values(zonesSeekChangedMessage).reduce((acc, val) => {
          const { queueTimeRemaining, seekPosition, zoneId } = val;
          if (seekPosition) {
            return fp.merge(acc, {
              [zoneId]: {
                queueTimeRemaining,
                nowPlaying: {
                  seekPosition,
                },
              },
            });
          } else {
            return fp.merge(acc, {
              [zoneId]: {
                queueTimeRemaining,
              },
            });
          }
        }, currentZones),
      );
    };

    const handleZonesChangedMessage = (zonesChangedMessage: {
      zones: Record<string, Zone>;
    }) => {
      setZones((currentZones) => {
        return {
          ...currentZones,
          ...zonesChangedMessage.zones,
        };
      });
    };

    const handleQueueChangedMessage = ({
      zoneId,
      queueItems,
    }: {
      zoneId: string;
      queueItems: RoonQueueItem[];
    }) => {
      setQueues((currentQueues) => {
        const mergedQueues = mergeQueues(currentQueues, zoneId, queueItems);

        return mergedQueues;
      });
    };

    socket.on('initialState', handleInitialStateMessage);
    socket.on('zonesSeekChanged', handleZonesSeekChangedMessage);
    socket.on('zonesChanged', handleZonesChangedMessage);
    socket.on('queueChanged', handleQueueChangedMessage);

    return () => {
      socket.off('initialState', handleInitialStateMessage);
      socket.off('zonesSeekChanged', handleZonesSeekChangedMessage);
      socket.off('zonesChanged', handleZonesChangedMessage);
      socket.off('queueChanged', handleQueueChangedMessage);
    };
  }, []);

  const value = useMemo(() => ({ zones, queues }), [zones, queues]);

  return (
    <PlaybackContext.Provider value={value}>
      {children}
    </PlaybackContext.Provider>
  );
}

export { PlaybackProvider, usePlayback };
