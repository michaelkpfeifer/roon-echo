import { useContext } from 'react';

import AppContext from '../AppContext';
import { findSelectedZone } from '../utils';

function Controls() {
  const { config, roonState, socketRef } = useContext(AppContext);

  const selectedZone = findSelectedZone(roonState.zones, config.selectedZoneId);

  if (selectedZone === null) {
    return null;
  }

  if (selectedZone.nowPlaying === null) {
    return null;
  }

  const controls = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      key={selectedZone.zoneId}
    >
      <span style={{ flex: 3 }}>{selectedZone.displayName}</span>
      <span style={{ flex: 3 }}>{selectedZone.nowPlaying.oneLine.line1}</span>
      <span style={{ flex: 1 }}>{selectedZone.nowPlaying.seekPosition}</span>
      <span style={{ flex: 1 }}>
        <button
          type="button"
          onClick={() => {
            socketRef.current.emit('pause', { zoneId: selectedZone.zoneId });
          }}
          disabled={selectedZone.state === 'paused'}
        >
          Pause
        </button>
      </span>
      <span style={{ flex: 1 }}>
        <button
          type="button"
          onClick={() => {
            socketRef.current.emit('play', { zoneId: selectedZone.zoneId });
          }}
          disabled={selectedZone.state === 'playing'}
        >
          Play
        </button>
      </span>
    </div>
  );

  return <div>{controls}</div>;
}

export default Controls;
