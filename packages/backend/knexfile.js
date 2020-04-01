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
    client: 'postgresql',
    connection: {
      user: 'postgres',
      password: 'password',
      database: 'development'
    },
    pool: {
      min: 2,
      max: 10
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
