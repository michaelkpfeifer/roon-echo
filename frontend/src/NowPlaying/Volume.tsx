import { useContext } from 'react';

import AppContext from '../AppContext';
import { findSelectedZone } from '../utils';

function Volume() {
  const { config, zones } = useContext(AppContext);

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
