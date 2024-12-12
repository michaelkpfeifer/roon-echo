import { useContext } from 'react';

import AppContext from '../AppContext';

function Albums() {
  const { appState } = useContext(AppContext);

  if (appState.selectedScreen !== 'albums') {
    return null;
  }

  return <h1>Albums</h1>;
}

export default Albums;
