import { useContext } from 'react';

import AppContext from '../AppContext';
import { lookupZoneName } from '../utils';

function Queues() {
  const { appState, config, coreUrlRef, roonState } = useContext(AppContext);
  const coreUrl = coreUrlRef.current;

  return (
    <>
      <h1 className="heading-display">Queues</h1>
      <div className="queue-container">
        {config.selectedZoneId && appState.queues[config.selectedZoneId] && (
          <div className="queue-heading">
            <div className="queue-heading__name">
              {lookupZoneName(roonState.zones, config.selectedZoneId)}
            </div>
            <div>
              {appState.queues[config.selectedZoneId].map(
                ({ queueItemId, length, imageKey, threeLine }) => (
                  <div className="queue-item" key={queueItemId}>
                    <div className="queue-item__image">
                      <img
                        className="queue-item__image-display"
                        src={`${coreUrl}/api/image/${imageKey}?scale=fit&width=150&height=150`}
                        alt={threeLine.line1}
                      />
                    </div>
                    <div className="queue-item__queue-item-id">
                      {queueItemId}
                    </div>
                    <div className="queue-item__line-1">{threeLine.line1}</div>
                    <div className="queue-item__line-2">{threeLine.line2}</div>
                    <div className="queue-item__line-3">{threeLine.line3}</div>
                    <div className="queue-item__length">{length}</div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Queues;
