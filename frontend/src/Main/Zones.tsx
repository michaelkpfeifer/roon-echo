import { useContext } from 'react';

import AppContext from '../AppContext';

function Zones() {
  const { zones } = useContext(AppContext);

  return (
    <>
      <h1 className="heading-display">Zones</h1>
      <div className="zones-container">
        {Object.values(zones).map((zone) => (
          <div key={zone.zoneId}>{zone.displayName}</div>
        ))}
      </div>
    </>
  );
}

export default Zones;
