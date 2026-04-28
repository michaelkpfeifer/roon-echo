import { useContext } from 'react';

import AppContext from '../AppContext';

function Zones() {
  const { zones } = useContext(AppContext);

  return (
    <div>
      {Object.values(zones).map((zone) => (
        <div key={zone.zoneId}>{zone.displayName}</div>
      ))}
    </div>
  );
}

export default Zones;
