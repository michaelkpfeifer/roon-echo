import { useContext } from 'react';

import AppContext from '../AppContext';
import { findConfiguredZone } from '../utils';

function SelectedZone() {
  const { config, roonState } = useContext(AppContext);

  const configuredZone = findConfiguredZone(
    roonState.zones,
    config.configuredZoneId,
  );

  if (configuredZone === null) {
    return null;
  }

  if (configuredZone.nowPlaying === null) {
    return null;
  }

  return <b>{configuredZone.displayName}</b>;
}

export default SelectedZone;
