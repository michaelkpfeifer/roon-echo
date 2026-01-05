import { useContext } from 'react';

import AppContext from '../AppContext';
import { lookupZoneName } from '../utils';

function Queues() {
  const { appState, config, roonState } = useContext(AppContext);

  return (
    <>
      <h1 className="heading-display">Queues</h1>
      <div className="queues-container">
        {config.selectedZoneId && appState.queues[config.selectedZoneId] && (
          <div>
            <h2>{lookupZoneName(roonState.zones, config.selectedZoneId)}</h2>
            <table>
              <tbody>
                {appState.queues[config.selectedZoneId].map(
                  ({ queueItemId, length, imageKey, threeLine }) => (
                    <tr key={queueItemId}>
                      <td>{queueItemId}</td>
                      <td>{length}</td>
                      <td>{imageKey}</td>
                      <td>{threeLine.line1}</td>
                      <td>{threeLine.line2}</td>
                      <td>{threeLine.line3}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default Queues;
