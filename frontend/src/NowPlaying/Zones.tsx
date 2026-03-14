import { useContext } from 'react';

import AppContext from '../AppContext';
import SelectedZone from './SelectedZone';
import ZoneSelection from './ZoneSelection';

function Zones() {
  const { setAppState } = useContext(AppContext);

  const openModal = () =>
    setAppState((currentAppState) => ({
      ...currentAppState,
      isZonesModalOpen: true,
    }));

  return (
    <>
      <SelectedZone />
      <button type="button" onClick={openModal}>
        Zones
      </button>
      <ZoneSelection />
    </>
  );
}

export default Zones;
