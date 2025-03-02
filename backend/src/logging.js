import knexInit from 'knex';

import knexConfig from '../knexfile.js';

const knex = knexInit(knexConfig.development);

const logChanged = (message) => {
  knex.transaction(async (trx) => {
    await trx('roon_messages').insert({
      message_type: 'Changed',
      message,
    });
  });

  return null;
};

const logChangedUnknown = (subMessage) => {
  knex.transaction(async (trx) => {
    await trx('roon_messages').insert({
      message_type: 'Changed',
      sub_type: 'Unknown',
      message: subMessage,
    });
  });

  return null;
};

const logChangedZones = (subMessage) => {
  knex.transaction(async (trx) => {
    await trx('roon_messages').insert({
      message_type: 'Changed',
      sub_type: 'zones',
      message: subMessage,
    });
  });

  return null;
};

const logChangedZonesSeek = (subMessage) => {
  knex.transaction(async (trx) => {
    await trx('roon_messages').insert({
      message_type: 'Changed',
      sub_type: 'zonesSeek',
      message: subMessage,
    });
  });

  return null;
};

const logSubscribed = (message) => {
  knex.transaction(async (trx) => {
    await trx('roon_messages').insert({
      message_type: 'Subscribed',
      message,
    });
  });

  return null;
};

const logUnknown = (message) => {
  knex.transaction(async (trx) => {
    await trx('roon_messages').insert({
      message_type: 'Subscribed',
      message,
    });
  });

  return null;
};

export {
  logChanged,
  logChangedUnknown,
  logChangedZones,
  logChangedZonesSeek,
  logSubscribed,
  logUnknown,
};
