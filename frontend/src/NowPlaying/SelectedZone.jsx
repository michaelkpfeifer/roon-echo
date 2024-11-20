import { useContext } from 'react';

import AppContext from '../AppContext';
import { findSelectedZone } from '../utils';

function SelectedZone() {
  const { config, roonState } = useContext(AppContext);

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
