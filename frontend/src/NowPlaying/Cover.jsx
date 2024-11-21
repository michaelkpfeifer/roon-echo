import { useContext } from 'react';

import AppContext from '../AppContext';
import { findSelectedZone } from '../utils';

function Cover() {
  const { config, coreUrlRef, roonState } = useContext(AppContext);
  const coreUrl = coreUrlRef.current;

  const selectedZone = findSelectedZone(roonState.zones, config.selectedZoneId);

  if (selectedZone === null) {
    return null;
  }

  if (selectedZone.nowPlaying === null) {
    return null;
  }

  const imageUrl = `${coreUrl}/api/image/${selectedZone.nowPlaying.imageKey}?scale=fit&width=72&height=72`;

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
