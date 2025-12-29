const pool = {
  afterCreate: (conn, cb) => {
    conn.pragma('busy_timeout = 250');
    conn.pragma('journal_mode = WAL');
    cb();
  },
};

export default {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: './db/mb.development.sqlite3',
    },
    useNullAsDefault: true,
    pool,
  },

  test: {
    client: 'better-sqlite3',
    connection: {
      filename: './db/mb.test.sqlite3',
    },
    useNullAsDefault: true,
    pool,
  },

  staging: {
    client: 'better-sqlite3',
    connection: {
      filename: './db/mb.staging.sqlite3',
    },
    useNullAsDefault: true,
    pool,
  },

  production: {
    client: 'better-sqlite3',
    connection: {
      filename: './db/mb.production.sqlite3',
    },
    useNullAsDefault: true,
    pool,
  },
};
