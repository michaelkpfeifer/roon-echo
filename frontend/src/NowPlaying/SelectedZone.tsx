import { useContext } from 'react';

import AppContext from '../AppContext';
import { findSelectedZone } from '../utils';

function SelectedZone() {
  const { config, roonState } = useContext(AppContext);

  if (roonState === null) {
    throw new Error('Error: Cannot get Roon State')
  }

  const selectedZone = findSelectedZone(roonState.zones, config.selectedZoneId);

  if (selectedZone === null) {
    return null;
  }

  if (selectedZone.nowPlaying === null) {
    return null;
  }

  return <b>{selectedZone.displayName}</b>;
}

export default SelectedZone;
