import { useContext } from 'react';

import AppContext from '../AppContext';
import { findSelectedZone } from '../utils';

function Cover() {
  const { config, coreUrl, roonState } = useContext(AppContext);

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

  /* eslint-disable no-console */
  // console.log('Cover.jsx: Cover(), selectedZone:', selectedZone);
  /* eslint-enable no-console */

  return (
    <div>
      <img src={imageUrl} alt="" />
      <div>
        <span>{selectedZone.nowPlaying.twoLine.line1}</span>
        <br />
        <span>{selectedZone.nowPlaying.twoLine.line2}</span>
      </div>
    </div>
  );
}

export default Cover;
