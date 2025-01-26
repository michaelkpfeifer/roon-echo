import { useContext, useEffect } from 'react';

import AppContext from '../AppContext';
import TrackRow from './TrackRow';

function Tracks() {
  const { appState, socketRef } = useContext(AppContext);

  useEffect(() => {
    socketRef.current.emit('tracks');
  }, [socketRef]);

  return (
    <>
      <h1>Tracks</h1>
      <div className="tracks-container">
        {appState.tracks.map((track) => (
          <div key={track.item_key}>
            <TrackRow track={track} />
          </div>
        ))}
      </div>
    </>
  );
}

export default Tracks;
