import { useContext } from 'react';

import AppContext from '../AppContext';

function Album() {
  const { appState } = useContext(AppContext);

  if (appState.selectedScreen !== 'album') {
    return null;
  }

  return (
    <>
      <h1>Album</h1>
      <div>
        {appState.album.map((track) => (
          <div key={track.item_key}>{track.title}</div>
        ))}
      </div>
    </>
  );
}

export default Album;
