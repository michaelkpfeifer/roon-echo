import { useContext } from 'react';

import AppContext from '../AppContext';
import { lookupZoneName } from '../utils';

function Queues() {
  const { appState, roonState } = useContext(AppContext);

  /* eslint-disable no-console */
  console.log('Queues.jsx: Queues(): appstate.queues', appState.queues);
  /* eslint-enable no-console */

  return (
    <>
      <h1>Queues</h1>
      <div className="queues-container">
        {Object.entries(appState.queues).map(([zoneId, queue]) => {
          return (
            <>
              <h2>{lookupZoneName(roonState.zones, zoneId)}</h2>
              <table>
                {queue.map(({ queueItemId, length, imageKey, threeLine }) => {
                  return (
                    <tr>
                      <td>{queueItemId}</td>
                      <td>{length}</td>
                      <td>{imageKey}</td>
                      <td>{threeLine.line1}</td>
                      <td>{threeLine.line2}</td>
                      <td>{threeLine.line3}</td>
                    </tr>
                  );
                })}
              </table>
            </>
          );
        })}
      </div>
    </>
  );
}

export default Queues;
