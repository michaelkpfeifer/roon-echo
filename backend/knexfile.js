export default {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: './db/mb.development.sqlite3',
    },
    useNullAsDefault: true,
  },

  test: {
    client: 'better-sqlite3',
    connection: {
      filename: './db/mb.test.sqlite3',
    },
    useNullAsDefault: true,
  },

  staging: {
    client: 'better-sqlite3',
    connection: {
      filename: './db/mb.staging.sqlite3',
    },
    useNullAsDefault: true,
  },

  production: {
    client: 'better-sqlite3',
    connection: {
      filename: './db/mb.production.sqlite3',
    },
    useNullAsDefault: true,
  },
};
