import { useContext } from 'react';

import AppContext from '../AppContext';
import ZoneRow from './ZoneRow';

function Zones() {
  const { zones } = useContext(AppContext);

  return (
    <>
      <h1 className="heading-display">Zones</h1>
      <div className="zones-container">
        {[...Object.values(zones)]
          .sort((a, b) => a.displayName.localeCompare(b.displayName))
          .map((zone) => (
            <div key={zone.zoneId}>
              <ZoneRow zone={zone} />
            </div>
          ))}
      </div>
    </>
  );
}

export default Zones;
