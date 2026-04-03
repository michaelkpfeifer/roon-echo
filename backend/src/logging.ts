import knexInit from 'knex';

import knexConfig from '../knexfile.js';

const knex = knexInit(knexConfig.development);

const logChanged = (message: string) => {
  knex.transaction(async (trx) => {
    await trx('roon_messages').insert({
      message_type: 'Changed',
      message,
    });
  });

  return null;
};

const logChangedUnknown = (subType: string, subMessage: string) => {
  knex.transaction(async (trx) => {
    await trx('roon_messages').insert({
      message_type: 'Changed',
      sub_type: subType,
      message: subMessage,
    });
  });

  return null;
};

const logChangedZonesChanged = (subMessage: string) => {
  knex.transaction(async (trx) => {
    await trx('roon_messages').insert({
      message_type: 'Changed',
      sub_type: 'zonesChanged',
      message: subMessage,
    });
  });

  return null;
};

const logChangedZonesAdded = (subMessage: string) => {
  knex.transaction(async (trx) => {
    await trx('roon_messages').insert({
      message_type: 'Changed',
      sub_type: 'zonesAdded',
      message: subMessage,
    });
  });

  return null;
};

const logChangedZonesRemoved = (subMessage: string) => {
  knex.transaction(async (trx) => {
    await trx('roon_messages').insert({
      message_type: 'Changed',
      sub_type: 'zonesRemoved',
      message: subMessage,
    });
  });

  return null;
};

const logChangedZonesSeekChanged = (subMessage: string) => {
  knex.transaction(async (trx) => {
    await trx('roon_messages').insert({
      message_type: 'Changed',
      sub_type: 'zonesSeekChanged',
      message: subMessage,
    });
  });

  return null;
};

const logSubscribed = (message: string) => {
  knex.transaction(async (trx) => {
    await trx('roon_messages').insert({
      message_type: 'Subscribed',
      message,
    });
  });

  return null;
};

const logUnknown = (message: string) => {
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
  logChangedZonesAdded,
  logChangedZonesChanged,
  logChangedZonesRemoved,
  logChangedZonesSeekChanged,
  logSubscribed,
  logUnknown,
};
