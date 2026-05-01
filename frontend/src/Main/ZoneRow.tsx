import type { Zone } from '../../../shared/internal/zone';

type MainZoneProps = {
  zone: Zone;
};

function ZoneRow({ zone }: MainZoneProps) {
  return (
    <div className="zone-row">
      <div className="zone-row__display-name">{zone.displayName}</div>
      <div className="zone-row__state">{zone.state}</div>
      <div className="zone-row__queue-time-remaining">
        {zone.queueTimeRemaining}
      </div>
    </div>
  );
}

export default ZoneRow;
