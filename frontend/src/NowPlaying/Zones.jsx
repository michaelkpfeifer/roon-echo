import { useContext } from 'react';
import AppContext from '../AppContext';

const Zones = () => {
  const { appState, roonState, setAppState } = useContext(AppContext);

  // console.log('Zones.jsx: Zones(): roonState:', roonState);
  // console.log('Zones.jsx: Zones(): appState:', appState);

  const isZoneSelected = (zoneId) => {
    // console.log('Zones.jsx: isZoneSelected(): zoneId:', zoneId);

    return appState.selectedZoneId === zoneId;
  };

  const handleZoneSelection = (zoneId) => {
    // console.log('Zone.jsx: Zones:(): zoneId:', zoneId);

    if (isZoneSelected(zoneId)) {
      return setAppState((currentAppState) => {
        return { ...currentAppState, selectedZoneId: null };
      });
    } else {
      return setAppState((currentAppState) => {
        return { ...currentAppState, selectedZoneId: zoneId };
      });
    }
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
            ></input>
          </span>
        </div>
      ))}
    </>
  );
};

export default Zones;
