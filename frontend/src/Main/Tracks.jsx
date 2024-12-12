import { useContext } from 'react';

import AppContext from '../AppContext';

function Tracks() {
  const { appState } = useContext(AppContext);

  if (appState.selectedScreen !== 'tracks') {
    return null;
  }

  return <h1>Tracks</h1>;
}

export default Tracks;
