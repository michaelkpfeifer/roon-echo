import { useContext } from 'react';

import AppContext from '../AppContext';

function Zones() {
  const { appState, roonState, setAppState } = useContext(AppContext);

  // console.log('Zones.jsx: Zones(): roonState:', roonState);
  // console.log('Zones.jsx: Zones(): appState:', appState);

  const isZoneSelected = (zoneId) => appState.selectedZoneId === zoneId;

  const handleZoneSelection = (zoneId) => {
    if (isZoneSelected(zoneId)) {
      return setAppState((currentAppState) => ({
        ...currentAppState,
        selectedZoneId: null,
      }));
    }
    return setAppState((currentAppState) => ({
      ...currentAppState,
      selectedZoneId: zoneId,
    }));
  };

  // console.log('Zones.jsx, Zones(): appState:', appState);

  return (
    <>
      <b>Zones</b>
      {Object.values(roonState.zones).map((zone) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          key={zone.zoneId}
        >
          <span style={{ flex: 5 }}>{zone.displayName}</span>
          <span style={{ flex: 2 }}>{zone.state}</span>
          <span style={{ flex: 2 }}>{zone.queueTimeRemaining}</span>
          <span style={{ flex: 1 }}>
            <input
              type="checkbox"
              checked={isZoneSelected(zone.zoneId)}
              onChange={() => handleZoneSelection(zone.zoneId)}
            />
          </span>
        </div>
      ))}
    </>
  );
}

export default Zones;
