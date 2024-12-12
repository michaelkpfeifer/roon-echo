import { useContext } from 'react';

import AppContext from '../AppContext';

function Artists() {
  const { appState } = useContext(AppContext);

  if (appState.selectedScreen !== 'artists') {
    return null;
  }

  return <h1>Artists</h1>;
}

export default Artists;
