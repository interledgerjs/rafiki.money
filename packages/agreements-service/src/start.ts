#!/usr/bin/env node
import * as winston from 'winston'
import { App } from './app'
import Knex from 'knex'
import { Model } from 'objection'
import { AgreementBucket } from './services/agreementBucket'
import Redis from 'ioredis'

const PORT = Number(process.env.PORT) || 3002
const DATABASE_CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING || ':memory:'
const DATABASE_CLIENT = process.env.DATABASE_CLIENT || 'sqlite3'

const REDIS_URI = process.env.REDIS_URI

// tslint:disable-next-line
const stringify = (value: any): string => typeof value === 'bigint' ? value.toString() : JSON.stringify(value)
const formatter = winston.format.printf(({ service, level, message, component, timestamp, ...metaData }) => {
  return `${timestamp} [${service}${component ? '-' + component : ''}] ${level}: ${message}` + (metaData ? ' meta data: ' + stringify(metaData) : '')
})

winston.configure({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    formatter
  ),
  defaultMeta: { service: 'ishara' },
  transports: [
    new winston.transports.Console()
  ]
})

// configure knex and bind to objection js
const knex = Knex({
  client: DATABASE_CLIENT,
  connection: DATABASE_CONNECTION_STRING
})
console.log('db conn string', DATABASE_CONNECTION_STRING)
Model.knex(knex)

const redis = new Redis(REDIS_URI)
const agreementBucket = new AgreementBucket(redis)

const app = new App(agreementBucket)

const gracefulShutdown = async (): Promise<void> => {
  app.shutdown()
  // knex.destroy()
}

const start = async (): Promise<void> => {
  let shuttingDown = false
  process.on('SIGINT', async () => {
    try {
      if (shuttingDown) {
        winston.warn('received second SIGINT during graceful shutdown, exiting forcefully.')
        process.exit(1)
        return
      }

      shuttingDown = true

      // Graceful shutdown
      await gracefulShutdown()
      process.exit(0)
    } catch (err) {
      const errInfo = (err && typeof err === 'object' && err.stack) ? err.stack : err
      winston.error('error while shutting down. error=%s', errInfo)
      process.exit(1)
    }
  })

  if (knex.client.config.connection.filename === ':memory:') {
    await knex.migrate.latest()
  } else {
    const status = await knex.migrate.status().catch(error => {
      winston.error('Error getting migrations status.', { error })
      winston.info('Please ensure your run the migrations before starting Ishara')
      process.exit(1)
    })
    if (status !== 0) {
      winston.error('You need to run the latest migrations before running Ishara')
      process.exit(1)
    }
  }

  app.listen(PORT)
}

start().catch(e => {
  const errInfo = (e && typeof e === 'object' && e.stack) ? e.stack : e
  winston.error(errInfo)
})
