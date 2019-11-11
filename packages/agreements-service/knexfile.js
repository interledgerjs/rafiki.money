const { knexSnakeCaseMappers } = require('objection');

module.exports = {
  testing: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: ':memory:'
    },
    pool: {
      // afterCreate: (conn, cb) => {
      //   conn.run('PRAGMA foreign_keys = ON', cb);
      // }
    }
  },
  development: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: './test.db'
    },
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  },
  production: {
    client: 'postgresql',
    connection: {
      database: 'example'
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};