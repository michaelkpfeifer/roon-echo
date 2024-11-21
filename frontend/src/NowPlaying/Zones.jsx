import { useContext, useState } from 'react';

import AppContext from '../AppContext';
import Modal from '../Modal';
import SelectedZone from './SelectedZone';

function Zones() {
  const { appState, roonState, setAppState, setConfig } =
    useContext(AppContext);

  const openModal = () =>
    setAppState((currentAppState) => ({
      ...currentAppState,
      isZonesModalOpen: true,
    }));

  const closeModal = () =>
    setAppState((currentAppState) => ({
      ...currentAppState,
      isZonesModalOpen: false,
    }));

  const isZoneSelected = (zoneId) => appState.tmpSelectedZoneId === zoneId;

  const handleZoneSelection = (zoneId) =>
    setAppState((currentAppState) => ({
      ...currentAppState,
      tmpSelectedZoneId: zoneId,
    }));

  const handleConfirm = () =>
    setConfig((currentConfig) => ({
      ...currentConfig,
      selectedZoneId: appState.tmpSelectedZoneId,
    }));

  return (
    <>
      <SelectedZone />
      <button type="button" onClick={openModal}>
        Zones
      </button>
      <Modal
        isOpen={appState.isZonesModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
      >
        {Object.values(roonState.zones).map((zone) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            key={zone.zoneId}
          >
            <span style={{ flex: 5 }}>{zone.displayName}</span>
            <span style={{ flex: 2 }}>{zone.state}</span>
            <span style={{ flex: 2 }}>{zone.queueTimeRemaining}</span>
            <span style={{ flex: 1 }}>
              <input
                type="checkbox"
                checked={isZoneSelected(zone.zoneId)}
                onChange={() => handleZoneSelection(zone.zoneId)}
              />
            </span>
          </div>
        ))}
      </Modal>
    </>
  );
}

export default Zones;
