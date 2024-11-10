import { useContext } from 'react';
import AppContext from '../AppContext';
import { findSelectedZone } from '../utils';

const Controls = () => {
  const { appState, roonState, socketRef } = useContext(AppContext);

  // console.log('Controls.jsx: Controls(): roonState:', roonState);
  // console.log('Controls.jsx: Controls(): appState:', appState);

  const selectedZone = findSelectedZone(
    Object.values(roonState.zones),
    appState.selectedZoneId,
  );

  // console.log('Controls.jsx: Controls(): selectedZone:', selectedZone);

  if (selectedZone === null) {
    return null;
  }

  if (selectedZone.nowPlaying === null) {
    return null;
  }

  // console.log(
  //   'Controls.jsx: Controls(): selectedZone.zoneId:',
  //   selectedZone.zoneId,
  // );

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

  return (
    <div>
      <b>Controls</b>
      {controls}
    </div>
  );
};

export default Controls;
