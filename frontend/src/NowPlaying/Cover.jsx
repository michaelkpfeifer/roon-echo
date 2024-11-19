import { useContext } from 'react';

import AppContext from '../AppContext';
import { findConfiguredZone } from '../utils';

function Cover() {
  const { config, coreUrlRef, roonState } = useContext(AppContext);
  const coreUrl = coreUrlRef.current;

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

  const imageUrl = `${coreUrl}/api/image/${configuredZone.nowPlaying.imageKey}?scale=fit&width=80&height=80`;

  /* eslint-disable no-console */
  // console.log('Cover.jsx: Cover(), imageUrl:', imageUrl);
  /* eslint-enable no-console */

  return (
    <div>
      <img src={imageUrl} alt="" />
    </div>
  );
}

export default Cover;
