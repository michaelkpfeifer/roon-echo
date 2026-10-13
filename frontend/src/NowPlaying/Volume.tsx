import { useApp } from '../AppContext';
import { usePlayback } from '../PlaybackContext';
import { findSelectedZone } from '../utils';

function Volume() {
  const { config } = useApp();
  const { zones } = usePlayback();

  const selectedZone = findSelectedZone(zones, config.selectedZoneId);

  if (selectedZone === null) {
    return null;
  }

  if (selectedZone.nowPlaying === null) {
    return null;
  }

  return <div>Volume</div>;
}

export default Volume;
