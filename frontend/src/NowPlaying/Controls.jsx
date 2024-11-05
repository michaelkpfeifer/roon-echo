import { useContext } from 'react';
import AppContext from '../AppContext';

const Controls = () => {
  const { appState, roonState, socketRef } = useContext(AppContext);

  console.log('Zones.jsx: Zones(): roonState:', roonState);
  console.log('Zones.jsx: Zones(): appState:', appState);

  const controls = (
    <>
      {Object.values(roonState.zones)
        .filter((zone) => zone.nowPlaying)
        .map((zone) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            key={zone.zoneId}
          >
            <span style={{ flex: 3 }}>{zone.displayName}</span>
            <span style={{ flex: 3 }}>{zone.nowPlaying.oneLine.line1}</span>
            <span style={{ flex: 1 }}>{zone.nowPlaying.seekPosition}</span>
            <span style={{ flex: 1 }}>
              <button
                onClick={() => {
                  socketRef.current.emit('pause', { zoneId: zone.zoneId });
                }}
                disabled={zone.state === 'paused'}
              >
                Pause
              </button>
            </span>
            <span style={{ flex: 1 }}>
              <button
                onClick={() => {
                  socketRef.current.emit('play', { zoneId: zone.zoneId });
                }}
                disabled={zone.state === 'playing'}
              >
                Play
              </button>
            </span>
          </div>
        ))}
    </>
  );

  return (
    <div>
      <b>Controls</b>
      {controls}
    </div>
  );
};

export default Controls;
