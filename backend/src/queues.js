import fp from 'lodash/fp.js';

const extractQueueItems = (queue) => {
  if (fp.has(['items'], queue)) {
    return queue.items;
  }

  if (fp.has(['changes'], queue)) {
    const insertOperation = queue.changes.find(
      (change) => change.operation === 'insert',
    );

    if (insertOperation) {
      return insertOperation.items;
    }
  }

  throw new Error('Error: Cannot extract items from queue');
};

/* eslint-disable import/prefer-default-export */
export { extractQueueItems };
/* eslint-disable import/prefer-default-export */
