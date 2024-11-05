import { useContext, useState } from 'react';
import AppContext from '../AppContext';

const Zones = () => {
  const [zoneSelectionVisible, setZoneSelectionVisible] = useState(false);

  const { appState, roonState } = useContext(AppContext);

  // console.log('Zones.jsx: Zones(): roonState:', roonState);
  // console.log('Zones.jsx: Zones(): appState:', appState);

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
          <span style={{ flex: 2 }}>{zone.displayName}</span>
          <span style={{ flex: 1 }}>{zone.state}</span>
          <span style={{ flex: 1 }}>{zone.queueTimeRemaining}</span>
        </div>
      ))}
    </>
  );
};

export default Zones;
