module.exports = {
  testing: {
    client: 'postgresql',
    connection: {
      user: 'postgres',
      password: 'password',
      database: 'testing'
    },
    pool: {
      min: 2,
      max: 10
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
        conn.run('PRAGMA foreign_keys = ON', cb)
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
}
