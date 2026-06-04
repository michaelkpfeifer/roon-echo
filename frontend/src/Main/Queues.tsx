import { useContext } from 'react';

import AppContext from '../AppContext';
import { formatRoonTrackLength, lookupZoneName } from '../utils';
import noAlbumArt from '../images/no-album-art.svg';

function Queues() {
  const { appState, config, coreUrl, zones } = useContext(AppContext);

  return (
    <>
      <h1 className="heading-display">Queues</h1>
      <div className="queue-container">
        {config.selectedZoneId && appState.queues[config.selectedZoneId] && (
          <div className="queue-heading">
            <div className="queue-heading__name">
              {lookupZoneName(zones, config.selectedZoneId)}
            </div>
            <div>
              {appState.queues[config.selectedZoneId].map(
                ({ queueItemId, length, imageKey, threeLine }) => (
                  <div className="queue-item" key={queueItemId}>
                    {imageKey ? (
                      <img
                        className="queue-item__image"
                        src={`${coreUrl}/api/image/${imageKey}?scale=fit&width=150&height=150`}
                        alt={threeLine.line1}
                      />
                    ) : (
                      <img
                        className="queue-item__image"
                        src={noAlbumArt}
                        alt={threeLine.line1}
                      />
                    )}
                    <div className="queue-item__track">
                      <div className="queue-item__line-1">
                        {threeLine.line1}
                      </div>
                      <div className="queue-item__line-2">
                        {threeLine.line2}
                      </div>
                      <div className="queue-item__line-3">
                        {threeLine.line3}
                      </div>
                    </div>
                    <div className="queue-item__queue-item-id">
                      {queueItemId}
                    </div>
                    <div className="queue-item__length">
                      {formatRoonTrackLength(length)}
                    </div>
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
