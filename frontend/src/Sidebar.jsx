import { useContext } from 'react';

import AppContext from './AppContext';
import { setSelectedScreen } from './utils';

function Sidebar() {
  const { socketRef, setAppState } = useContext(AppContext);

  const handleScreenSelection = (event) => {
    const selectedScreen = event.target.value;
    setAppState((currentAppContext) =>
      setSelectedScreen(currentAppContext, selectedScreen),
    );
    socketRef.current.emit(selectedScreen);
  };

  return (
    <div>
      <div>
        Artists
        <input
          name="selectedScreen"
          value="artists"
          type="radio"
          onChange={handleScreenSelection}
        />
      </div>
      <div>
        Albums
        <input
          name="selectedScreen"
          value="albums"
          type="radio"
          onChange={handleScreenSelection}
        />
      </div>
      <div>
        Tracks
        <input
          name="selectedScreen"
          value="tracks"
          type="radio"
          onChange={handleScreenSelection}
        />
      </div>
    </div>
  );
}

export default Sidebar;
