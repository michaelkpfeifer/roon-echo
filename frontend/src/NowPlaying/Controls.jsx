import { useContext } from 'react';

import AppContext from '../AppContext';
import { findConfiguredZone } from '../utils';

function Controls() {
  const { config, roonState, socketRef } = useContext(AppContext);

  const configuredZone = findConfiguredZone(
    roonState.zones,
    config.configuredZoneId,
  );

  if (configuredZone === null) {
    return null;
  }

  if (configuredZone.nowPlaying === null) {
    return null;
  }

  const controls = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      key={configuredZone.zoneId}
    >
      <span style={{ flex: 3 }}>{configuredZone.displayName}</span>
      <span style={{ flex: 3 }}>{configuredZone.nowPlaying.oneLine.line1}</span>
      <span style={{ flex: 1 }}>{configuredZone.nowPlaying.seekPosition}</span>
      <span style={{ flex: 1 }}>
        <button
          type="button"
          onClick={() => {
            socketRef.current.emit('pause', { zoneId: configuredZone.zoneId });
          }}
          disabled={configuredZone.state === 'paused'}
        >
          Pause
        </button>
      </span>
      <span style={{ flex: 1 }}>
        <button
          type="button"
          onClick={() => {
            socketRef.current.emit('play', { zoneId: configuredZone.zoneId });
          }}
          disabled={configuredZone.state === 'playing'}
        >
          Play
        </button>
      </span>
    </div>
  );

  return <div>{controls}</div>;
}

export default Controls;
