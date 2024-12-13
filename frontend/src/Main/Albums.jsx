import { useContext } from 'react';

import AppContext from '../AppContext';

function Albums() {
  const { albums, appState, coreUrlRef } = useContext(AppContext);
  const coreUrl = coreUrlRef.current;

  if (appState.selectedScreen !== 'albums') {
    return null;
  }

  return (
    <>
      <h1>Albums</h1>
      <div>
        {appState.albums.map((album) => (
          <div key={album.image_key}>
            <div>
              <b>{album.title}</b>
            </div>
            <div>{album.subtitle}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Albums;
