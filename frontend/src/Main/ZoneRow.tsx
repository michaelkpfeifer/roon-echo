import { useContext } from 'react';

import type { Zone } from '../../../shared/internal/zone';
import AppContext from '../AppContext';

type MainZoneProps = {
  zone: Zone;
};

function ZoneRow({ zone }: MainZoneProps) {
  const { domSelectedZoneId, setConfig, setDomSelectedZoneId } =
    useContext(AppContext);

  const handleZoneSelection = () => {
    setDomSelectedZoneId(zone.zoneId);
    setConfig((currentConfig) => ({
      ...currentConfig,
      selectedZoneId: zone.zoneId,
    }));
  };

  const isZoneSelected = domSelectedZoneId === zone.zoneId;

  return (
    /* eslint-disable jsx-a11y/label-has-associated-control */
    <label>
      <div className="zone-row">
        <input
          type="radio"
          name="zone-selection-group"
          value={zone.zoneId}
          checked={isZoneSelected}
          onChange={handleZoneSelection}
        />
        <div className="zone-row__display-name">{zone.displayName}</div>
        <div className="zone-row__state">{zone.state}</div>
        <div className="zone-row__queue-time-remaining">
          {zone.queueTimeRemaining}
        </div>
      </div>
    </label>
    /* eslint-enable jsx-a11y/label-has-associated-control */
  );
}

export default ZoneRow;
