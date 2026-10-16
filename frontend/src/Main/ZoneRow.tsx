import type { Zone } from '../../../shared/internal/zone';
import { useApp } from '../AppContext';
import { formatAsHoursMinutesSeconds } from '../utils';

type MainZoneProps = {
  zone: Zone;
};

function ZoneRow({ zone }: MainZoneProps) {
  const { config, setSelectedZoneId } = useApp();

  const handleZoneSelection = () => {
    setSelectedZoneId(zone.zoneId);
  };

  const isZoneSelected = config.selectedZoneId === zone.zoneId;

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
          {formatAsHoursMinutesSeconds(zone.queueTimeRemaining)}
        </div>
      </div>
    </label>
    /* eslint-enable jsx-a11y/label-has-associated-control */
  );
}

export default ZoneRow;
