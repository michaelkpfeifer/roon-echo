import { useContext } from 'react';

import AppContext from './AppContext';

function Sidebar() {
  const { socketRef } = useContext(AppContext);

  return (
    <>
      <div>
        <button type="button" onClick={() => socketRef.current.emit('artists')}>
          Artists
        </button>
      </div>
      <div>
        <button type="button" onClick={() => socketRef.current.emit('albums')}>
          Albums
        </button>
      </div>
      <div>
        <button type="button" onClick={() => socketRef.current.emit('tracks')}>
          Tracks
        </button>
      </div>
    </>
  );
}

export default Sidebar;
