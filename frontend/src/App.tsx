import fp from 'lodash/fp';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AppContext from './AppContext';
import { loadConfig, saveConfig } from './config';
import type { AppContextType } from './internal/appContextType';
import Album from './Main/Album';
import Albums from './Main/Albums';
import Artists from './Main/Artists';
import Home from './Main/Home';
import Queues from './Main/Queues';
import Tracks from './Main/Tracks';
import Zones from './Main/Zones';
import NowPlaying from './NowPlaying';
import Sidebar from './Sidebar';
import { socket } from './socket';
import { mergeAlbumAggregate, mergeQueues } from './utils';
import type { AlbumAggregate } from '../../shared/internal/albumAggregate';
import type { RoonQueueItem } from '../../shared/internal/roonQueueItem';
import type { Zone } from '../../shared/internal/zone';
import type { ZoneSeekPosition } from '../../shared/internal/zoneSeekPosition';

function App() {
  const [albumAggregates, setAlbumAggregates] = useState<AlbumAggregate[]>([]);
  const [config, setConfig] = useState(
    () => loadConfig() || { selectedZoneId: null },
  );
  const [coreUrl, setCoreUrl] = useState<string | null>(null);
  const [domSelectedZoneId, setDomSelectedZoneId] = useState<string | null>(
    null,
  );
  const [isAlbumArtModalOpen, setIsAlbumArtModalOpen] = useState(false);
  const [queues, setQueues] = useState({});
  const [zones, setZones] = useState<Record<string, Zone>>({});

  useEffect(() => saveConfig(config), [config]);

  useEffect(() => {
    socket.connect();

    const handleInitialStateMessage = (initialState: {
      zones: Record<string, Zone>;
    }) => {
      setZones(initialState.zones);

      setDomSelectedZoneId(loadConfig().selectedZoneId || null);
    };

    socket.on('initialState', handleInitialStateMessage);

    const handleCoreUrlMessage = (roonCoreUrl: string) => {
      setCoreUrl(roonCoreUrl);
    };

    socket.on('coreUrl', handleCoreUrlMessage);

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

    socket.on('zonesSeekChanged', handleZonesSeekChangedMessage);

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

    socket.on('zonesChanged', handleZonesChangedMessage);

    const handleAlbumAggregatesMessage = (
      albumAggregates: AlbumAggregate[],
    ) => {
      setAlbumAggregates(albumAggregates);
    };

    socket.on('albumAggregates', handleAlbumAggregatesMessage);

    const handleAlbumAggregateUpdate = (albumAggregate: AlbumAggregate) => {
      setAlbumAggregates((currentAlbumAggregates) =>
        mergeAlbumAggregate(currentAlbumAggregates, albumAggregate),
      );
    };

    socket.on('albumAggregateUpdate', handleAlbumAggregateUpdate);

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

    socket.on('queueChanged', handleQueueChangedMessage);

    return () => {
      socket.off('queueChanged', handleQueueChangedMessage);
      socket.off('albumAggregateUpdate', handleAlbumAggregateUpdate);
      socket.off('albumAggregates', handleAlbumAggregatesMessage);
      socket.off('zonesChanged', handleZonesChangedMessage);
      socket.off('zonesSeekChanged', handleZonesSeekChangedMessage);
      socket.off('coreUrl', handleCoreUrlMessage);
      socket.off('initialState', handleInitialStateMessage);
      socket.disconnect();
    };
  }, []);

  /* eslint-disable no-console */
  // console.log('App.jsx: App(): config:', config);
  /* eslint-enable no-console */

  const appContextValue: AppContextType = {
    albumAggregates,
    config,
    coreUrl,
    domSelectedZoneId,
    isAlbumArtModalOpen,
    queues,
    setConfig,
    setDomSelectedZoneId,
    setIsAlbumArtModalOpen,
    setQueues,
    zones,
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <Router>
        <div className="page">
          <div className="header" />
          <div className="container">
            <div className="left">
              <Sidebar />
            </div>
            <div className="right">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/albums" element={<Albums />} />
                <Route path="/albums/:id" element={<Album />} />
                <Route path="/artists" element={<Artists />} />
                <Route path="/tracks" element={<Tracks />} />
                <Route path="/queues" element={<Queues />} />
                <Route path="/zones" element={<Zones />} />
              </Routes>
            </div>
          </div>
          <div className="footer">
            <NowPlaying />
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
