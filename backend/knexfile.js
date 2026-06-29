const base = {
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'roon_echo',
    port: 5432,
    password: process.env.PGPASSWORD,
  },
};

export default {
  development: {
    ...base,
    connection: { ...base.connection, database: 'roon_echo_development' },
  },
  test: {
    ...base,
    connection: { ...base.connection, database: 'roon_echo_test' },
  },
  production: {
    ...base,
    connection: { ...base.connection, database: 'roon_echo_production' },
  },
};
