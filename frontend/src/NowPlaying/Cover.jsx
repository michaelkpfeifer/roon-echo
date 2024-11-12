import { useContext } from 'react';

import AppContext from '../AppContext';
import { findSelectedZone } from '../utils';

function Cover() {
  const { appState, roonState, coreUrlRef } = useContext(AppContext);
  const coreUrl = coreUrlRef.current;

  // console.log('Cover.jsx: Cover(), coreUrl:', coreUrl);
  // console.log('Cover.jsx: Cover(), roonState:', roonState);

  const selectedZone = findSelectedZone(
    Object.values(roonState.zones),
    appState.selectedZoneId,
  );

  if (selectedZone === null) {
    return null;
  }

  if (selectedZone.nowPlaying === null) {
    return null;
  }

  // console.log(
  //   'Cover.jsx: Cover(): selectedZone:',
  //   JSON.stringify(selectedZone, null, 4),
  // );

  // console.log(
  //   'Cover.jsx: Cover(): selectedZone.nowPlaying.imageKey:',
  //   selectedZone.nowPlaying.imageKey,
  // );

  const imageUrl = `${coreUrl}/api/image/${selectedZone.nowPlaying.imageKey}?scale=fit&width=80&height=80`;

  /* eslint-disable no-console */
  console.log('Cover.jsx: Cover(), imageUrl:', imageUrl);
  /* eslint-enable no-console */

  return (
    <div>
      <b>Cover</b>
      <img src={imageUrl} alt="" />
    </div>
  );
}

export default Cover;
